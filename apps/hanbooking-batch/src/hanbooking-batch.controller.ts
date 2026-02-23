import { Controller, Get } from '@nestjs/common';
import { HanbookingBatchService } from './hanbooking-batch.service';

@Controller()
export class HanbookingBatchController {
  constructor(private readonly hanbookingBatchService: HanbookingBatchService) {}

  @Get()
  getHello(): string {
    return this.hanbookingBatchService.getHello();
  }
}
