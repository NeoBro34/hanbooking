import { Field, GraphQLISODateTime, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Min } from "class-validator";
import mongoose from "mongoose";
import { OrderStatus } from "../../enums/booking.enum";

@InputType()
export class BookingUpdate {
    @IsNotEmpty()
    @Field(() => String)
    _id: mongoose.ObjectId;

    @IsOptional()
    @Field(() => OrderStatus, { nullable: true })
    bookingStatus?: OrderStatus;

    canceledAt?: Date;
}