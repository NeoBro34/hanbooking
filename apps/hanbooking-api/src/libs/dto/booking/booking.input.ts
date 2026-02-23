import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import mongoose from 'mongoose';
import { OrderStatus } from '../../enums/booking.enum';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { availablePropertySorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class CreateBookingInput {
    @IsNotEmpty()
    @Field(() => String)
    memberId: mongoose.ObjectId;

    @IsNotEmpty()
    @Field(() => String)
    propertyId: mongoose.ObjectId;

    @IsNotEmpty()
    @Field(() => Number)
    @Min(1)
    guests: number;

    @IsNotEmpty()
    @Field(() => GraphQLISODateTime)
    checkInDate: Date;

    @IsNotEmpty()
    @Field(() => GraphQLISODateTime)
    checkOutDate: Date;

    @IsNotEmpty()
    @Field(() => Number)
    totalPrice: number;

    @IsOptional()
    @Field(() => OrderStatus, { nullable: true })
    bookingStatus?: OrderStatus;
}

@InputType()
export class BookingRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@InputType()
class PISearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: mongoose.ObjectId;

  @IsOptional()
  @Field(() => [PropertyLocation], { nullable: true })
  locationList?: PropertyLocation[];

  @IsOptional()
  @Field(() => [PropertyType], { nullable: true })
  typeList?: PropertyType[];

  @IsOptional()
  @Field(() => [Int], { nullable: true })
  roomsList?: Number[];

  @IsOptional()
  @Field(() => [Int], { nullable: true })
  bedsList?: Number[];

  @IsOptional()
  @Field(() => BookingRange, { nullable: true })
  bookingsRange?: BookingRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class BookingsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availablePropertySorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => PISearch)
  search: PISearch;
}

@InputType()
class APISearch {
  @IsOptional()
  @Field(() => OrderStatus, { nullable: true })
  bookingStatus?: OrderStatus;
}

@InputType()
export class AgentBookingInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availablePropertySorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => APISearch)
  search: APISearch;
}

@InputType()
class ALPISearch {
  @IsOptional()
  @Field(() => OrderStatus, { nullable: true })
  bookingStatus?: OrderStatus;

  @IsOptional()
  @Field(() => [PropertyLocation], { nullable: true })
  propertyLocationList?: PropertyLocation[];
}

@InputType()
export class AllBookingsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availablePropertySorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ALPISearch)
  search: ALPISearch;
}

@InputType()
export class BookingsOrdinaryInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}