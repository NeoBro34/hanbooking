import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../../enums/notification.enum';
import { Member, TotalCounter } from '../member/member';
import { Property } from '../property/property';
import { BoardArticle } from '../board-article/board-article';

@ObjectType()
export class Notification {
  @Field(() => String)
  _id: mongoose.ObjectId;

  @Field(() => NotificationType)
  notificationType: NotificationType;

  @Field(() => NotificationStatus)
  notificationStatus: NotificationStatus;

  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @Field(() => String)
  notificationTitle: string;

  @Field(() => String, { nullable: true })
  notificationDesc?: string;

  @Field(() => String)
  authorId: mongoose.ObjectId;

  @Field(() => String)
  receiverId: mongoose.ObjectId;

  @Field(() => String, { nullable: true })
  propertyId?: mongoose.ObjectId;

  @Field(() => String, { nullable: true })
  articleId?: mongoose.ObjectId;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  /** from aggregation **/
  @Field(() => Member, { nullable: true })
  authorData?: Member;

  @Field(() => Member, { nullable: true })
  receiverData?: Member;

  @Field(() => Property, { nullable: true })
  propertyData?: Property;

  @Field(() => BoardArticle, { nullable: true })
  articleData?: BoardArticle;
}

@ObjectType()
export class Notifications {
  @Field(() => [Notification])
  list: Notification[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
