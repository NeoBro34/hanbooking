import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  CreateNotificationInput,
  NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import {
  Notification,
  Notifications,
} from '../../libs/dto/notification/notification';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  public async createNotification(
    authorId: ObjectId,
    input: CreateNotificationInput,
  ): Promise<Notification> {
    input.authorId = authorId;

    try {
      return await this.notificationModel.create(input);
    } catch (err) {
      console.log('Error, Notification.model:', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getMyNotifications(
    memberId: ObjectId,
    input: NotificationsInquiry,
  ): Promise<Notifications> {
    const { notificationStatus, notificationGroup, notificationType } = input.search;
    const match: T = { receiverId: memberId };
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    if (notificationStatus) match.notificationStatus = notificationStatus;
    if (notificationGroup) match.notificationGroup = notificationGroup;
    if (notificationType) match.notificationType = notificationType;

    const result = await this.notificationModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              {
                $lookup: {
                  from: 'members',
                  localField: 'authorId',
                  foreignField: '_id',
                  as: 'authorData',
                },
              },
              { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'members',
                  localField: 'receiverId',
                  foreignField: '_id',
                  as: 'receiverData',
                },
              },
              { $unwind: { path: '$receiverData', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'properties',
                  localField: 'propertyId',
                  foreignField: '_id',
                  as: 'propertyData',
                },
              },
              { $unwind: { path: '$propertyData', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'boardarticles',
                  localField: 'articleId',
                  foreignField: '_id',
                  as: 'articleData',
                },
              },
              { $unwind: { path: '$articleData', preserveNullAndEmptyArrays: true } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    return result[0];
  }

  public async markNotificationRead(
    memberId: ObjectId,
    notificationId: ObjectId,
  ): Promise<Notification> {
    const result = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: notificationId,
          receiverId: memberId,
          notificationStatus: { $ne: NotificationStatus.READ },
        },
        { notificationStatus: NotificationStatus.READ },
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  public async markAllNotificationsRead(memberId: ObjectId): Promise<boolean> {
    const result = await this.notificationModel
      .updateMany(
        {
          receiverId: memberId,
          notificationStatus: NotificationStatus.WAIT,
        },
        { notificationStatus: NotificationStatus.READ },
      )
      .exec();

    return !!result.acknowledged;
  }
}
