import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import mongoose from "mongoose";
import { PropertyLocation, PropertyStatus, PropertyType } from "../../enums/property.enum";

@InputType()
export class PropertyUpdate {
    @IsNotEmpty()
    @Field(() => String)
    _id: mongoose.ObjectId;   // _id: ObjectId !!!

    @IsOptional()
    @Field(() => PropertyType, { nullable: true })
    propertyType?: PropertyType;

    @IsOptional()
    @Field(() => PropertyStatus, { nullable: true })
    propertyStatus?: PropertyStatus;

    @IsOptional()
    @Field(() => PropertyLocation, { nullable: true })
    propertyLocation?: PropertyLocation;

    @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    propertyAddress?: string;

    @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    propertyTitle?: string;

    @IsOptional()
    @Field(() => Number, { nullable: true })
    propertyPricePerNight?: number;

    @IsOptional()
    @Field(() => Number, { nullable: true })
    propertyMaxGuests?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Field(() => Int, { nullable: true })
    propertyBeds?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Field(() => Int, { nullable: true })
    propertyRooms?: number;

    @IsOptional()
    @Field(() => [String], { nullable: true })
    propertyImages?: string[];

    @IsOptional()
    @Field(() => [String], { nullable: true })
    amenities?: string[];

    @IsOptional()
    @Length(5, 500)
    @Field(() => String, { nullable: true })
    propertyDesc?: string;

    deletedAt?: Date;

    @IsOptional()
    @Field(() => Date, { nullable: true })
    constructedAt?: Date;
}