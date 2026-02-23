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
    @Field(() => String)
    memberId?: mongoose.ObjectId;

    @IsOptional()
    @Field(() => String)
    propertyId?: mongoose.ObjectId;

    @IsOptional()
    @Field(() => Number)
    @Min(1)
    guests?: number;

    @IsOptional()
    @Field(() => GraphQLISODateTime)
    checkInDate?: Date;

    @IsOptional()
    @Field(() => GraphQLISODateTime)
    checkOutDate?: Date;

    @IsOptional()
    @Field(() => Number)
    totalPrice?: number;

    @IsOptional()
    @Field(() => OrderStatus, { nullable: true })
    bookingStatus?: OrderStatus;
}