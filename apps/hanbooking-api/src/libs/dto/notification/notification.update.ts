import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

@InputType()
export class NotificationReadInput {
  @IsNotEmpty()
  @Field(() => String)
  _id: mongoose.ObjectId;
}
