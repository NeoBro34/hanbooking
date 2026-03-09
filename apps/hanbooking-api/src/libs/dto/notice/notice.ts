import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Notice {
  @Field(() => String)
  _id: mongoose.ObjectId;

  @Field(() => NoticeCategory)
  noticeCategory: NoticeCategory;

  @Field(() => NoticeStatus)
  noticeStatus: NoticeStatus;

  @Field(() => String)
  noticeTitle: string;

  @Field(() => String)
  noticeContent: string;

  @Field(() => String)
  memberId: mongoose.ObjectId;

  @Field(() => String, { nullable: true })
  inquiryAnswer?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  answeredAt?: Date;

  @Field(() => String, { nullable: true })
  answeredBy?: mongoose.ObjectId;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  /** from aggregation **/
  @Field(() => Member, { nullable: true })
  memberData?: Member;

  @Field(() => Member, { nullable: true })
  answeredByData?: Member;
}

@ObjectType()
export class Notices {
  @Field(() => [Notice])
  list: Notice[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
