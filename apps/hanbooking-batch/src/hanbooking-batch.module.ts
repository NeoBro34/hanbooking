import { Module } from '@nestjs/common';
import { HanbookingBatchController } from './hanbooking-batch.controller';
import { HanbookingBatchService } from './hanbooking-batch.service';

@Module({
  imports: [],
  controllers: [HanbookingBatchController],
  providers: [HanbookingBatchService],
})
export class HanbookingBatchModule {}
