
import { Injectable } from '@nestjs/common';
import axios from 'axios'; // For fetching weather data from OpenWeatherMap

@Injectable()
export class WeatherService {
  private apiKey: string = '0d53c43c4e4dc03f03e693ac1bb5eb2c'; // Replace with your OpenWeatherMap API key

  // Method to fetch weather data for a city
  async getWeather(city: string): Promise<string> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      return `Weather in ${city}: ${data.main.temp}°C, ${data.weather[0].description}`;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return 'Could not fetch weather data.';
    }
  }
}
