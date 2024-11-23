
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service';
import { WeatherModule } from '../weather/weather.module'; 

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, WeatherModule],
  providers: [BotService],
  exports: [BotService]
})
export class BotModule {}
