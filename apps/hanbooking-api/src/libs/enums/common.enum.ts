import { registerEnumType } from '@nestjs/graphql';

export enum Message {
  SOMETHING_WENT_WRONG = 'Something went wrong!',
  NO_DATA_FOUND = 'No data is found!',
  CREATE_FAILED = 'Create is failed!',
  UPDATE_FAILED = 'Update is failed!',
  REMOVE_FAILED = 'Remove failed!',
  UPLOAD_FAILED = 'Upload failed!',
  BAD_REQUEST = 'Bad Request',

  USED_MEMBER_NICK_OR_PHONE = 'Already used member nick or phone!',
  NO_MEMBER_NICK = 'No number with that member nick!',
  WRONG_PASSWORD = 'Wrong password, please try again!',
  BLOCKED_USER = 'You have been blocked!',
  NOT_AUTHENTICATED = 'You are not authenticated, Plase login first!',
  USED_NICK_PHONE = 'You are inserting already used nick or phone!',
  TOKEN_CREATION_FAILED = 'Token creation error!',
  TOKEN_NOT_EXIST = 'Bearer Token is not provided!',
  ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles!',
  NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
  PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, ipeg or png images!',
  SELF_SUBSCRIPTION_DENIED = 'Self subscription is denied!',
  PROPERTY_AVAILABLE = 'Property is available on these dates',
}

export enum Direction {
  ASC = 1,
  DESC = -1,
}
registerEnumType(Direction, {
  name: 'Direction',
});
