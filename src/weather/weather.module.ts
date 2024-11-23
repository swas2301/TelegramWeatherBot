
import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service'; // Import the WeatherService

@Module({
  providers: [WeatherService], // Declare the WeatherService as a provider
  exports: [WeatherService],   // Export the WeatherService for use in other modules
})
export class WeatherModule {}
