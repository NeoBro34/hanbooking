import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import { MemberService } from '../member/member.service';
import { AgentBookingInquiry, AllBookingsInquiry, CreateBookingInput } from '../../libs/dto/booking/booking.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { lookupMember, lookupProperty, shapeIntoMongoObjectId } from '../../libs/config';
import { OrderStatus } from '../../libs/enums/booking.enum';
import { Property } from '../../libs/dto/property/property';
import { Connection } from 'mongoose';
import { T } from '../../libs/types/common';
import { BookingUpdate } from '../../libs/dto/booking/booking.update';
import { PropertyService } from '../property/property.service';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel('Booking') private readonly bookingModel: Model<Booking>,
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        @InjectConnection() private readonly connection: Connection,
        private readonly propertyService: PropertyService,
        private memberService: MemberService,
    ) {}

    /** createBooking **/
    public async createBooking(memberId: ObjectId, input: CreateBookingInput): Promise<Booking> {
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

        try {
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

    /** completeBooking **/
    public async completeBooking( id: ObjectId ): Promise<Booking> {

        const now = new Date();

        const booking = await this.bookingModel.findOneAndUpdate(
            {
                _id: id,
                bookingStatus: OrderStatus.CONFIRMED,
                checkOutDate: { $lte: now },
            },
            {
                bookingStatus: OrderStatus.COMPLETED,
            },
            { new: true },
        );

        if (!booking) {
            throw new BadRequestException(
            'Booking cannot be completed',
            );
        }

        await this.propertyService.propertyStatsEditor({
            _id: booking.propertyId,
            targetKey: 'propertyPoints',
            modifier: 1,
        });

        await this.memberService.memberStatsEditor({
            _id: booking.memberId,
            targetKey: 'memberPoints',
            modifier: 1,
        });

        return booking;
    }

    /** getMyBookings **/
    public async getMyBookings(memberId: ObjectId, input: AllBookingsInquiry): Promise<Bookings> {

        const match: T = {
            memberId: memberId,
        };

        /** booking status filter **/
        if (input?.search?.bookingStatus) {
            match.bookingStatus = input.search.bookingStatus;
        }

        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        const result = await this.bookingModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        lookupMember,
                        lookupProperty,
                        { $unwind: '$memberData' },
                        { $unwind: '$propertyData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ]).exec();

        return result[0];
    }

    /** getAgentBookings **/
    public async getAgentBookings( memberId: ObjectId, input: AgentBookingInquiry ): Promise<Bookings> {

        const { propertyId } =input.search;

        const propertyObjectId = shapeIntoMongoObjectId(propertyId);

        const property = await this.propertyModel.findOne({
            _id: propertyObjectId,
            memberId,
        })
        .lean();
        if (!property) throw new ForbiddenException('Not allowed');

        const match: T = {
            propertyId: propertyObjectId,
            bookingStatus: OrderStatus.CONFIRMED,
        };
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        const result = await this.bookingModel.aggregate(
            [
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1 ) * input.limit },
                            { $limit: input.limit },
                            lookupMember,
                            { $unwind: '$memberData' },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();
        if(!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

     /** Admin **/

    /** getAllPropertiesByAdmin **/
    public async getAllBookingsByAdmin(input: AllBookingsInquiry): Promise<Bookings> {
        const { bookingStatus, propertyLocationList } = input.search;
        const match: T = {};
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        if(bookingStatus) match.bookingStatus = bookingStatus;
        if(propertyLocationList) match.propertyLocationList = { $in: propertyLocationList };

        const result = await this.bookingModel.aggregate(
            [
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            lookupMember,
                            { $unwind: '$memberData' },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ]
        ).exec();
        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }


    private async calculatePrice( propertyId: ObjectId, checkIn: Date, checkOut: Date, guests: number ): Promise<number> {

        const propertyFind = await this.propertyModel.findById(propertyId).exec();
        const { propertyPricePerNight } = propertyFind;

        const nights = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);

        return nights * propertyPricePerNight;
    }
}
