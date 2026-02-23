import { Module } from '@nestjs/common';
import { HanbookingBatchController } from './hanbooking-batch.controller';
import { HanbookingBatchService } from './hanbooking-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [HanbookingBatchController],
  providers: [HanbookingBatchService],
})
export class HanbookingBatchModule {}
