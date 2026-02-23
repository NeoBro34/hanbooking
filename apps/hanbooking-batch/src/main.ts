import { NestFactory } from '@nestjs/core';
import { HanbookingBatchModule } from './hanbooking-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(HanbookingBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
