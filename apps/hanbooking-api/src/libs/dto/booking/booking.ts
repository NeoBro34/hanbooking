import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import mongoose from "mongoose";
import { OrderStatus } from "../../enums/booking.enum";
import { Member, TotalCounter } from "../member/member";
import { Property } from "../property/property";

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

    /** from aggregation **/
    
    @Field(() => Member, { nullable: true })
    memberData?: Member;

    @Field(() => Property, { nullable: true })
    propertyData?: Property;
}

@ObjectType()
export class Bookings {
    @Field(() => [Booking])
    list: Booking[];

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[];
}