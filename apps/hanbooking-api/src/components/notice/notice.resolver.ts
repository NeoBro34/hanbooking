import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { InquiryMessage } from '../../libs/dto/inquiry-message/inquiry-message';
import { SendInquiryMessageInput } from '../../libs/dto/inquiry-message/inquiry-message.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { CreateInquiryInput, CreateNoticeInput, NoticesInquiry } from '../../libs/dto/notice/notice.input';
import { AnswerInquiryInput, NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { NoticeService } from './notice.service';

@Resolver()
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async createNotice(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @Args('input') input: CreateNoticeInput,
  ): Promise<Notice> {
    console.log('Mutation: createNotice');
    return await this.noticeService.createNotice(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Notice)
  public async createInquiry(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @Args('input') input: CreateInquiryInput,
  ): Promise<Notice> {
    console.log('Mutation: createInquiry');
    return await this.noticeService.createInquiry(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Notices)
  public async getNotices(@Args('input') input: NoticesInquiry): Promise<Notices> {
    console.log('Query: getNotices');
    return await this.noticeService.getNotices(input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Notices)
  public async getMyInquiries(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @Args('input') input: NoticesInquiry,
  ): Promise<Notices> {
    console.log('Query: getMyInquiries');
    return await this.noticeService.getMyInquiries(memberId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Notices)
  public async getAllInquiriesByAdmin(@Args('input') input: NoticesInquiry): Promise<Notices> {
    console.log('Query: getAllInquiriesByAdmin');
    return await this.noticeService.getAllInquiriesByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async updateNoticeByAdmin(@Args('input') input: NoticeUpdate): Promise<Notice> {
    console.log('Mutation: updateNoticeByAdmin');
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.noticeService.updateNoticeByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async answerInquiryByAdmin(
    @AuthMember('_id') adminId: mongoose.ObjectId,
    @Args('input') input: AnswerInquiryInput,
  ): Promise<Notice> {
    console.log('Mutation: answerInquiryByAdmin');
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.noticeService.answerInquiry(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notice)
  public async removeNoticeByAdmin(@Args('noticeId') noticeId: string): Promise<Notice> {
    console.log('Mutation: removeNoticeByAdmin');
    return await this.noticeService.removeNoticeByAdmin(shapeIntoMongoObjectId(noticeId));
  }

  @UseGuards(AuthGuard)
  @Query(() => [InquiryMessage])
  public async getInquiryMessages(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @AuthMember('memberType') memberType: MemberType,
    @Args('inquiryId') inquiryId: string,
  ): Promise<InquiryMessage[]> {
    console.log('Query: getInquiryMessages');
    return await this.noticeService.getInquiryMessages(
      memberId,
      shapeIntoMongoObjectId(inquiryId),
      memberType,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation(() => InquiryMessage)
  public async sendInquiryMessage(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @AuthMember('memberType') memberType: MemberType,
    @Args('input') input: SendInquiryMessageInput,
  ): Promise<InquiryMessage> {
    console.log('Mutation: sendInquiryMessage');
    input.inquiryId = shapeIntoMongoObjectId(input.inquiryId);
    return await this.noticeService.sendInquiryMessage(memberId, input, memberType);
  }
}
