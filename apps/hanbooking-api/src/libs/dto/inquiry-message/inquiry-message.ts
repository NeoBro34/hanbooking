import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Member } from '../member/member';

@ObjectType()
export class InquiryMessage {
  @Field(() => String)
  _id: mongoose.ObjectId;

  @Field(() => String)
  inquiryId: mongoose.ObjectId;

  @Field(() => String)
  senderId: mongoose.ObjectId;

  @Field(() => String)
  message: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Member, { nullable: true })
  senderData?: Member;
}
