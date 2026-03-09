import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import mongoose from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { availableNoticeSorts } from '../../config';

@InputType()
export class CreateNoticeInput {
  @IsNotEmpty()
  @Field(() => NoticeCategory)
  noticeCategory: NoticeCategory;

  @IsNotEmpty()
  @Length(3, 120)
  @Field(() => String)
  noticeTitle: string;

  @IsNotEmpty()
  @Length(3, 5000)
  @Field(() => String)
  noticeContent: string;

  memberId?: mongoose.ObjectId;
}

@InputType()
export class CreateInquiryInput {
  @IsNotEmpty()
  @Length(3, 120)
  @Field(() => String)
  noticeTitle: string;

  @IsNotEmpty()
  @Length(3, 5000)
  @Field(() => String)
  noticeContent: string;
}

@InputType()
class NISearch {
  @IsOptional()
  @Field(() => NoticeCategory, { nullable: true })
  noticeCategory?: NoticeCategory;

  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: mongoose.ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class NoticesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableNoticeSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => NISearch)
  search: NISearch;
}
