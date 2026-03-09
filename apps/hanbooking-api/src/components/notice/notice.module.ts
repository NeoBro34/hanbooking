import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NoticeSchema from '../../schemas/Notice.model';
import NotificationSchema from '../../schemas/Notification.model';
import MemberSchema from '../../schemas/Member.model';
import InquiryMessageSchema from '../../schemas/InquiryMessage.model';
import { AuthModule } from '../auth/auth.module';
import { NoticeResolver } from './notice.resolver';
import { NoticeService } from './notice.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema }]),
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
    MongooseModule.forFeature([{ name: 'InquiryMessage', schema: InquiryMessageSchema }]),
    AuthModule,
  ],
  providers: [NoticeResolver, NoticeService],
  exports: [NoticeService],
})
export class NoticeModule {}
