import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Length } from 'class-validator';
import mongoose from 'mongoose';

@InputType()
export class SendInquiryMessageInput {
  @IsNotEmpty()
  @Field(() => String)
  inquiryId: mongoose.ObjectId;

  @IsNotEmpty()
  @Length(1, 2000)
  @Field(() => String)
  message: string;
}
