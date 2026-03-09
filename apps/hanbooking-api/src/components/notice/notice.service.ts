import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupMember } from '../../libs/config';
import { InquiryMessage } from '../../libs/dto/inquiry-message/inquiry-message';
import { SendInquiryMessageInput } from '../../libs/dto/inquiry-message/inquiry-message.input';
import { CreateInquiryInput, CreateNoticeInput, NoticesInquiry } from '../../libs/dto/notice/notice.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { AnswerInquiryInput, NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { NoticeCategory, NoticeStatus } from '../../libs/enums/notice.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('Notice') private readonly noticeModel: Model<Notice>,
    @InjectModel('Notification') private readonly notificationModel: Model<any>,
    @InjectModel('Member') private readonly memberModel: Model<any>,
    @InjectModel('InquiryMessage') private readonly inquiryMessageModel: Model<InquiryMessage>,
  ) {}

  private async notifyAllActiveMembers(authorId: ObjectId, notice: Notice): Promise<void> {
    const receivers = await this.memberModel
      .find(
        {
          memberStatus: MemberStatus.ACTIVE,
        },
        { _id: 1 },
      )
      .lean()
      .exec();

    if (!receivers?.length) return;

    const docs = receivers.map((receiver: any) => ({
      notificationType: NotificationType.NOTICE,
      notificationStatus: NotificationStatus.WAIT,
      notificationGroup: NotificationGroup.MEMBER,
      notificationTitle: notice.noticeTitle,
      notificationDesc: notice.noticeContent?.slice(0, 250),
      authorId: authorId,
      receiverId: receiver._id,
    }));

    if (!docs.length) return;
    await this.notificationModel.insertMany(docs);
  }

  private async notifyAdminsAboutInquiry(authorId: ObjectId, inquiry: Notice): Promise<void> {
    const admins = await this.memberModel
      .find(
        {
          memberStatus: MemberStatus.ACTIVE,
          memberType: MemberType.ADMIN,
        },
        { _id: 1 },
      )
      .lean()
      .exec();

    if (!admins?.length) return;
    const docs = admins.map((admin: any) => ({
      notificationType: NotificationType.INQUIRY,
      notificationStatus: NotificationStatus.WAIT,
      notificationGroup: NotificationGroup.MEMBER,
      notificationTitle: `New inquiry: ${inquiry.noticeTitle}`,
      notificationDesc: inquiry.noticeContent?.slice(0, 250),
      authorId,
      receiverId: admin._id,
    }));

    await this.notificationModel.insertMany(docs);
  }

  private async aggregateNotices(match: T, input: NoticesInquiry): Promise<Notices> {
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    const result = await this.noticeModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'members',
                  localField: 'answeredBy',
                  foreignField: '_id',
                  as: 'answeredByData',
                },
              },
              { $unwind: { path: '$answeredByData', preserveNullAndEmptyArrays: true } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async createNotice(memberId: ObjectId, input: CreateNoticeInput): Promise<Notice> {
    input.memberId = memberId;
    try {
      const createdNotice: Notice = await this.noticeModel.create(input);

      // Fire-and-forget semantics are avoided here to make writes deterministic.
      try {
        await this.notifyAllActiveMembers(memberId, createdNotice);
      } catch (notifyErr) {
        console.log('Notice notification dispatch error:', notifyErr?.message);
      }

      return createdNotice;
    } catch (err) {
      console.log('Error, Notice.model:', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async createInquiry(memberId: ObjectId, input: CreateInquiryInput): Promise<Notice> {
    try {
      const createdInquiry = await this.noticeModel.create({
        noticeCategory: NoticeCategory.INQUIRY,
        noticeStatus: NoticeStatus.HOLD,
        noticeTitle: input.noticeTitle,
        noticeContent: input.noticeContent,
        memberId,
      });

      await this.inquiryMessageModel.create({
        inquiryId: createdInquiry._id,
        senderId: memberId,
        message: input.noticeContent,
      });

      try {
        await this.notifyAdminsAboutInquiry(memberId, createdInquiry);
      } catch (notifyErr) {
        console.log('Inquiry notification dispatch error:', notifyErr?.message);
      }

      return createdInquiry;
    } catch (err) {
      console.log('Error, Notice.model:', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getNotices(input: NoticesInquiry): Promise<Notices> {
    const { noticeCategory, noticeStatus, memberId, text } = input.search;
    const match: T = {};

    if (noticeCategory === NoticeCategory.INQUIRY) {
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
    }
    if (noticeCategory) match.noticeCategory = noticeCategory;
    if (noticeStatus) match.noticeStatus = noticeStatus;
    if (memberId) match.memberId = memberId;
    if (text) {
      match.$or = [
        { noticeTitle: { $regex: new RegExp(text, 'i') } },
        { noticeContent: { $regex: new RegExp(text, 'i') } },
      ];
    }
    return await this.aggregateNotices(match, input);
  }

  public async getMyInquiries(memberId: ObjectId, input: NoticesInquiry): Promise<Notices> {
    const match: T = {
      memberId,
      noticeCategory: NoticeCategory.INQUIRY,
    };

    if (input.search.noticeStatus) match.noticeStatus = input.search.noticeStatus;
    if (input.search.text) {
      match.$or = [
        { noticeTitle: { $regex: new RegExp(input.search.text, 'i') } },
        { noticeContent: { $regex: new RegExp(input.search.text, 'i') } },
      ];
    }

    return await this.aggregateNotices(match, input);
  }

  public async getAllInquiriesByAdmin(input: NoticesInquiry): Promise<Notices> {
    const match: T = { noticeCategory: NoticeCategory.INQUIRY };

    if (input.search.noticeStatus) match.noticeStatus = input.search.noticeStatus;
    if (input.search.memberId) match.memberId = input.search.memberId;
    if (input.search.text) {
      match.$or = [
        { noticeTitle: { $regex: new RegExp(input.search.text, 'i') } },
        { noticeContent: { $regex: new RegExp(input.search.text, 'i') } },
      ];
    }

    return await this.aggregateNotices(match, input);
  }

  public async updateNoticeByAdmin(input: NoticeUpdate): Promise<Notice> {
    const result = await this.noticeModel
      .findOneAndUpdate(
        {
          _id: input._id,
          noticeCategory: { $ne: NoticeCategory.INQUIRY },
          noticeStatus: { $ne: NoticeStatus.DELETE },
        },
        input,
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  public async answerInquiry(adminId: ObjectId, input: AnswerInquiryInput): Promise<Notice> {
    const result = await this.noticeModel
      .findOneAndUpdate(
        {
          _id: input._id,
          noticeCategory: NoticeCategory.INQUIRY,
          noticeStatus: { $ne: NoticeStatus.DELETE },
        },
        {
          inquiryAnswer: input.inquiryAnswer,
          answeredAt: new Date(),
          answeredBy: adminId,
          noticeStatus: NoticeStatus.ACTIVE,
        },
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    try {
      await this.notificationModel.create({
        notificationType: NotificationType.INQUIRY,
        notificationStatus: NotificationStatus.WAIT,
        notificationGroup: NotificationGroup.MEMBER,
        notificationTitle: `Inquiry answered: ${result.noticeTitle}`,
        notificationDesc: input.inquiryAnswer?.slice(0, 250),
        authorId: adminId,
        receiverId: result.memberId,
      });
    } catch (notifyErr) {
      console.log('Inquiry answer notification dispatch error:', notifyErr?.message);
    }

    return result;
  }

  public async removeNoticeByAdmin(noticeId: ObjectId): Promise<Notice> {
    const result = await this.noticeModel
      .findOneAndUpdate(
        { _id: noticeId, noticeStatus: { $ne: NoticeStatus.DELETE } },
        { noticeStatus: NoticeStatus.DELETE },
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }

  public async getInquiryMessages(
    memberId: ObjectId,
    inquiryId: ObjectId,
    memberType?: MemberType,
  ): Promise<InquiryMessage[]> {
    const inquiry = await this.noticeModel
      .findOne({
        _id: inquiryId,
        noticeCategory: NoticeCategory.INQUIRY,
        noticeStatus: { $ne: NoticeStatus.DELETE },
      })
      .lean()
      .exec();
    if (!inquiry) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const isAdmin = memberType === MemberType.ADMIN;
    if (!isAdmin && String(inquiry.memberId) !== String(memberId)) {
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
    }

    return await this.inquiryMessageModel
      .aggregate([
        { $match: { inquiryId: inquiryId } },
        { $sort: { createdAt: Direction.ASC } },
        {
          $lookup: {
            from: 'members',
            localField: 'senderId',
            foreignField: '_id',
            as: 'senderData',
          },
        },
        { $unwind: { path: '$senderData', preserveNullAndEmptyArrays: true } },
      ])
      .exec();
  }

  public async sendInquiryMessage(
    memberId: ObjectId,
    input: SendInquiryMessageInput,
    memberType?: MemberType,
  ): Promise<InquiryMessage> {
    const inquiry = await this.noticeModel
      .findOne({
        _id: input.inquiryId,
        noticeCategory: NoticeCategory.INQUIRY,
        noticeStatus: { $ne: NoticeStatus.DELETE },
      })
      .lean()
      .exec();
    if (!inquiry) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const isAdmin = memberType === MemberType.ADMIN;
    if (!isAdmin && String(inquiry.memberId) !== String(memberId)) {
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
    }

    const newMessage = await this.inquiryMessageModel.create({
      inquiryId: input.inquiryId,
      senderId: memberId,
      message: input.message,
    });

    const receivers = isAdmin
      ? [inquiry.memberId]
      : (
          await this.memberModel
            .find(
              {
                memberStatus: MemberStatus.ACTIVE,
                memberType: MemberType.ADMIN,
              },
              { _id: 1 },
            )
            .lean()
            .exec()
        ).map((admin: any) => admin._id);

    if (receivers.length) {
      const docs = receivers.map((receiverId: ObjectId) => ({
        notificationType: NotificationType.INQUIRY,
        notificationStatus: NotificationStatus.WAIT,
        notificationGroup: NotificationGroup.MEMBER,
        notificationTitle: isAdmin ? `Inquiry reply: ${inquiry.noticeTitle}` : `New inquiry message: ${inquiry.noticeTitle}`,
        notificationDesc: input.message?.slice(0, 250),
        authorId: memberId,
        receiverId,
      }));

      await this.notificationModel.insertMany(docs);
    }

    return newMessage;
  }
}
