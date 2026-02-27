import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import mongoose from "mongoose";
import { OrderStatus } from "../../enums/booking.enum";
import { TotalCounter } from "../member/member";

@ObjectType()
export class Booking {
    @Field(() => String)
    _id: mongoose.ObjectId;

    @Field(() => String)
    memberId: mongoose.ObjectId;

    @Field(() => String)
    propertyId: mongoose.ObjectId;

    @Field(() => Number)
    guests: number;

    @Field(() => GraphQLISODateTime)
    checkInDate: Date;

    @Field(() => GraphQLISODateTime)
    checkOutDate: Date;

    @Field(() => Number)
    totalPrice: number;

    @Field(() => OrderStatus, { nullable: true })
    bookingStatus?: OrderStatus;
}

@ObjectType()
export class Bookings {
    @Field(() => [Booking])
    list: Booking[];

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[];
}