import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Booking } from '../../libs/dto/booking/booking';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { CreateBookingInput } from '../../libs/dto/booking/booking.input';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { OrderStatus } from '../../libs/enums/booking.enum';
import { Property } from '../../libs/dto/property/property';
import { Connection } from 'mongoose';
import { T } from '../../libs/types/common';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel('Booking') private readonly bookingModel: Model<Booking>,
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        @InjectConnection() private readonly connection: Connection,
        private memberService: MemberService,
    ) {}

    /** createBooking **/
    public async createBooking(memberId: ObjectId, input: CreateBookingInput): Promise<Booking> {
       try {
            const { propertyId, guests, checkInDate, checkOutDate } = input;
            const member = shapeIntoMongoObjectId(memberId);
            const property = shapeIntoMongoObjectId(propertyId);

            if (new Date(checkInDate) >= new Date(checkOutDate)) {
                throw new BadRequestException(Message.SOMETHING_WENT_WRONG);
            }

            const conflict = await this.bookingModel.findOne({
                propertyId: property,
                bookingStatus: OrderStatus.CONFIRMED,
                checkInDate: { $lt: checkOutDate },
                checkOutDate: { $gt: checkInDate },
            }).exec();

            if (conflict) throw new BadRequestException(Message.PROPERTY_AVAILABLE );

            const totalPrice = await this.calculatePrice(
                propertyId,
                checkInDate,
                checkOutDate,
                guests,
            );

            const booking = await this.bookingModel.create({
                memberId: member,
                propertyId: property,
                guests,
                checkInDate,
                checkOutDate,
                totalPrice,
                bookingStatus: OrderStatus.PENDING,
            });
            return booking;
       } catch (err) {
            console.log('Error, Booking.model:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
       }
    }

    /** confirmBooking **/
    public async confirmBooking( bookingId: ObjectId ): Promise<Booking> {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
        const booking = await this.bookingModel.findById(bookingId).session(session);

        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.bookingStatus !== OrderStatus.PENDING) 
            throw new BadRequestException('Booking not in pending state');

        const conflict = await this.bookingModel.findOne({
            _id: { $ne: booking._id },
            propertyId: booking.propertyId,
            bookingStatus: OrderStatus.CONFIRMED,
            checkInDate: { $lt: booking.checkOutDate },
            checkOutDate: { $gt: booking.checkInDate },
        }).session(session);

        if (conflict) throw new BadRequestException('Property already booked');

        booking.bookingStatus = OrderStatus.CONFIRMED;
        await booking.save({ session });

        await session.commitTransaction();
        return booking;

        } catch (err) {
            await session.abortTransaction();
            console.log('Error, Booking.model:', err.message);
                throw new BadRequestException(Message.SOMETHING_WENT_WRONG);
        } finally {
            session.endSession();
        }
    }

    /** cancelBooking **/
    public async cancelBooking( memberId: ObjectId, bookingId: ObjectId ): Promise<Booking> {

        const session = await this.connection.startSession();
        session.startTransaction();

    try {
        const booking = await this.bookingModel.findById(bookingId).session(session);

        if (!booking)
        throw new NotFoundException('Booking not found');

        if (booking.memberId.toString() !== memberId.toString())
        throw new ForbiddenException('Not allowed');

        if (
            booking.bookingStatus === OrderStatus.CANCELLED ||
            booking.bookingStatus === OrderStatus.COMPLETED
        )
        throw new BadRequestException('Cannot cancel this booking');

        const today = new Date();
        if (today >= booking.checkOutDate) throw new BadRequestException('Checkout already passed');

        booking.bookingStatus = OrderStatus.CANCELLED;

        await booking.save({ session });
        await session.commitTransaction();
        return booking;
        
        } catch (err) {
            await session.abortTransaction();
            console.log('Error, Booking.model:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        } finally {
            session.endSession();
        }
    }




    private async calculatePrice( propertyId: ObjectId, checkIn: Date, checkOut: Date, guests: number ): Promise<number> {

        const propertyFind = await this.propertyModel.findById(propertyId).exec();
        const { propertyPricePerNight } = propertyFind;

        const nights = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);

        return nights * propertyPricePerNight;
    }
}
