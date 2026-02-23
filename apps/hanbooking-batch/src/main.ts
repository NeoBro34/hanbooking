import { NestFactory } from '@nestjs/core';
import { HanbookingBatchModule } from './hanbooking-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(HanbookingBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
