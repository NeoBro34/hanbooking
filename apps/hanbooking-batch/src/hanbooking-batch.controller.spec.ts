import { Test, TestingModule } from '@nestjs/testing';
import { HanbookingBatchController } from './hanbooking-batch.controller';
import { HanbookingBatchService } from './hanbooking-batch.service';

describe('HanbookingBatchController', () => {
  let hanbookingBatchController: HanbookingBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HanbookingBatchController],
      providers: [HanbookingBatchService],
    }).compile();

    hanbookingBatchController = app.get<HanbookingBatchController>(HanbookingBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(hanbookingBatchController.getHello()).toBe('Hello World!');
    });
  });
});
