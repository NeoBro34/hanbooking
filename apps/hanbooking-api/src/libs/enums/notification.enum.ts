import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  BOOKING = 'BOOKING',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  INQUIRY = 'INQUIRY',
  NOTICE = 'NOTICE',
  GENERAL = 'GENERAL',
}
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

export enum NotificationStatus {
  WAIT = 'WAIT',
  READ = 'READ',
}
registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});

export enum NotificationGroup {
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  PROPERTY = 'PROPERTY',
}
registerEnumType(NotificationGroup, {
  name: 'NotificationGroup',
});
