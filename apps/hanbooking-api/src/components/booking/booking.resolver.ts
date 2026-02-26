import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Booking } from '../../libs/dto/booking/booking';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose from 'mongoose';
import { CreateBookingInput } from '../../libs/dto/booking/booking.input';

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
}
