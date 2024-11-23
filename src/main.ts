
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Create the NestJS application
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set the base directory for templates
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs'); // Use Handlebars
  app.enableCors();

  // Start the application
  await app.listen(3000);
  console.log(process.env.TELEGRAM_BOT_TOKEN);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();

