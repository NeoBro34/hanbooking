import { Injectable } from '@nestjs/common';

@Injectable()
export class HanbookingBatchService {
  getHello(): string {
    return 'Welcome to HanBooking BATCH Server';
  }
}
