import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Booking } from '../../libs/dto/booking/booking';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { CreateBookingInput } from '../../libs/dto/booking/booking.input';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { OrderStatus } from '../../libs/enums/booking.enum';
import { Property } from '../../libs/dto/property/property';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel('Booking') private readonly bookingModel: Model<Booking>,
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
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

    private async calculatePrice( propertyId: ObjectId, checkIn: Date, checkOut: Date, guests: number ): Promise<number> {

        const propertyFind = await this.propertyModel.findById(propertyId).exec();
        const { propertyPricePerNight } = propertyFind;

        const nights = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);

        return nights * propertyPricePerNight;
    }

}
