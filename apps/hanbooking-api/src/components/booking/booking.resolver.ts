import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose, { ObjectId } from 'mongoose';
import { AgentBookingInquiry, AllBookingsInquiry, CreateBookingInput } from '../../libs/dto/booking/booking.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class BookingResolver {
    constructor(private readonly bookingService: BookingService) {}

    /** createBooking **/
    @UseGuards(AuthGuard)
    @Mutation(() => Booking)
    public async createBooking(
        @AuthMember('_id') memberId: mongoose.ObjectId,
        @Args('input') input: CreateBookingInput,
    ): Promise<Booking> {
        console.log('Mutation: createBooking');
        return await this.bookingService.createBooking( memberId, input);
    }
    
    /** confirmBooking **/
    @UseGuards(AuthGuard)
    @Mutation(() => Booking)
    public async confirmBooking(
        @Args('bookingId') bookingId: string,
    ): Promise<Booking> {
        const id = shapeIntoMongoObjectId(bookingId);
        console.log('Mutation: confirmBooking');
        return await this.bookingService.confirmBooking(id);
    }

    /** cancelBooking **/
    @UseGuards(AuthGuard)
    @Mutation(() => Booking)
    public async cancelBooking(
        @Args('bookingId') bookingId: string,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Booking> {
        console.log('Mutation: cancelBooking');

        const id = shapeIntoMongoObjectId(bookingId);
        return await this.bookingService.cancelBooking(memberId, id);
    }

    /** getMyBookings **/
    @UseGuards(AuthGuard)
    @Query(() => Bookings)
    public async getMyBookings(
        @Args('input') input: AllBookingsInquiry,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Bookings> {
    console.log('Query: getMyBookings');

    return await this.bookingService.getMyBookings(memberId, input);
    }

    /** getAgentBookings **/
    @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Query(( returns ) => Bookings)
    public async getAgentBookings(
        @Args('input') input: AgentBookingInquiry,
        @AuthMember('_id') memberId: mongoose.ObjectId,
    ): Promise<Bookings> {
        console.log('Query: getAgentBookings');
        return await this.bookingService.getAgentBookings(memberId, input);
    }
}
