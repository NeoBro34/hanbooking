import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import mongoose from 'mongoose';
import { NoticeStatus } from '../../enums/notice.enum';

@InputType()
export class NoticeUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id: mongoose.ObjectId;

  @IsOptional()
  @Length(3, 120)
  @Field(() => String, { nullable: true })
  noticeTitle?: string;

  @IsOptional()
  @Length(3, 5000)
  @Field(() => String, { nullable: true })
  noticeContent?: string;

  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;
}

@InputType()
export class AnswerInquiryInput {
  @IsNotEmpty()
  @Field(() => String)
  _id: mongoose.ObjectId;

  @IsNotEmpty()
  @Length(3, 5000)
  @Field(() => String)
  inquiryAnswer: string;
}
