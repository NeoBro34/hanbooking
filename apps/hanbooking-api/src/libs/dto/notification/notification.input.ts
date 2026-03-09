import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import mongoose from 'mongoose';
import { availableNotificationSorts } from '../../config';
import { Direction } from '../../enums/common.enum';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../../enums/notification.enum';

@InputType()
export class CreateNotificationInput {
  @IsNotEmpty()
  @Field(() => NotificationType)
  notificationType: NotificationType;

  @IsNotEmpty()
  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @IsNotEmpty()
  @Length(3, 120)
  @Field(() => String)
  notificationTitle: string;

  @IsOptional()
  @Length(3, 1000)
  @Field(() => String, { nullable: true })
  notificationDesc?: string;

  @IsNotEmpty()
  @Field(() => String)
  receiverId: mongoose.ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  propertyId?: mongoose.ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  articleId?: mongoose.ObjectId;

  authorId?: mongoose.ObjectId;
}

@InputType()
class NotISearch {
  @IsOptional()
  @Field(() => NotificationStatus, { nullable: true })
  notificationStatus?: NotificationStatus;

  @IsOptional()
  @Field(() => NotificationGroup, { nullable: true })
  notificationGroup?: NotificationGroup;

  @IsOptional()
  @Field(() => NotificationType, { nullable: true })
  notificationType?: NotificationType;
}

@InputType()
export class NotificationsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableNotificationSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => NotISearch)
  search: NotISearch;
}
