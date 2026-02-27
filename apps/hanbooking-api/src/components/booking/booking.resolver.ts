import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Booking } from '../../libs/dto/booking/booking';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose, { ObjectId } from 'mongoose';
import { CreateBookingInput } from '../../libs/dto/booking/booking.input';
import { shapeIntoMongoObjectId } from '../../libs/config';

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

        const id = shapeIntoMongoObjectId(bookingId);
        return await this.bookingService.cancelBooking(memberId, id);
    }
}
