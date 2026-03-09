import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import {
  CreateNotificationInput,
  NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import {
  Notification,
  Notifications,
} from '../../libs/dto/notification/notification';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationService } from './notification.service';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Notification)
  public async createNotificationByAdmin(
    @AuthMember('_id') adminId: mongoose.ObjectId,
    @Args('input') input: CreateNotificationInput,
  ): Promise<Notification> {
    console.log('Mutation: createNotificationByAdmin');
    input.receiverId = shapeIntoMongoObjectId(input.receiverId);
    if (input.propertyId) input.propertyId = shapeIntoMongoObjectId(input.propertyId);
    if (input.articleId) input.articleId = shapeIntoMongoObjectId(input.articleId);

    return await this.notificationService.createNotification(adminId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Notifications)
  public async getMyNotifications(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @Args('input') input: NotificationsInquiry,
  ): Promise<Notifications> {
    console.log('Query: getMyNotifications');
    return await this.notificationService.getMyNotifications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Notification)
  public async markNotificationRead(
    @AuthMember('_id') memberId: mongoose.ObjectId,
    @Args('notificationId') notificationId: string,
  ): Promise<Notification> {
    console.log('Mutation: markNotificationRead');
    return await this.notificationService.markNotificationRead(
      memberId,
      shapeIntoMongoObjectId(notificationId),
    );
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async markAllNotificationsRead(
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<boolean> {
    console.log('Mutation: markAllNotificationsRead');
    return await this.notificationService.markAllNotificationsRead(memberId);
  }
}
