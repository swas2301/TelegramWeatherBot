import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeatherService } from '../weather/weather.service'; // Import the WeatherService
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';  // Add ConfigService for environment variables

@Injectable()
export class BotService {
  private bot: TelegramBot;
  private usernames: Map<number, string> = new Map(); // Store usernames by user ID
  private subscribedUsers: Set<number> = new Set();
  private userCities: Map<number, string> = new Map(); // Map to store cities for each user


  constructor(
    private weatherService: WeatherService,
    private configService: ConfigService, // Inject ConfigService
  ) {
    this.initializeBot();
  }

  private initializeBot() {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
   //   throw new Error('TELEGRAM_BOT_TOKEN is not set in the environment variables');
    }
    console.log('Bot Token:', botToken);

    this.bot = new TelegramBot(botToken, { polling: true });
    this.setupCommands();
  }

  updateBotToken(newApiKey: string) {
    // Update the environment variable (optional)
    process.env.TELEGRAM_BOT_TOKEN = newApiKey;

    // Re-initialize the bot with the new API key
    this.bot = new TelegramBot(newApiKey, { polling: true });
    this.setupCommands();

    console.log('Bot re-initialized with new API key');
  }

  private setupCommands() {
    this.bot.onText(/\/start/, (msg) => {
        this.bot.sendMessage(msg.chat.id, 'Welcome to the Weather Bot! Use /subscribe to get daily updates.');
      });
  
      this.bot.onText(/\/subscribe/, (msg) => {
        if (this.blockedUsers.has(msg.chat.id)) {
            this.bot.sendMessage(msg.chat.id, 'You are blocked from subscribing.');
            return;
          }
        if (this.subscribedUsers.has(msg.chat.id)) {
          this.bot.sendMessage(msg.chat.id, 'You are already subscribed.');
          return;
        }
        // Save the username when they subscribe
        const username = msg.from?.username || 'Unknown'; // Fallback if no username
        this.usernames.set(msg.chat.id, username);
        this.subscribedUsers.add(msg.chat.id);
        this.bot.sendMessage(msg.chat.id, 'You are now subscribed! Use /setcity <city_name> to set your city.');
      });
  
      this.bot.onText(/\/unsubscribe/, (msg) => {
        
        if (!this.subscribedUsers.has(msg.chat.id)) {
          this.bot.sendMessage(msg.chat.id, 'You are not subscribed yet.');
          return;
        }
        this.subscribedUsers.delete(msg.chat.id);
        this.userCities.delete(msg.chat.id);
        this.usernames.delete(msg.chat.id);
        this.bot.sendMessage(msg.chat.id, 'You have successfully unsubscribed and your data has been deleted.');
      });
  
      this.bot.onText(/\/setcity (.+)/, (msg, match) => {
        if (this.blockedUsers.has(msg.chat.id)) {
          this.bot.sendMessage(msg.chat.id, 'You are blocked by Admin.');
          return;
        }
        if (!this.subscribedUsers.has(msg.chat.id)) {
          this.bot.sendMessage(msg.chat.id, 'You need to subscribe first using /subscribe.');
          return;
        }
  
        const city = match[1];
        this.userCities.set(msg.chat.id, city);
        this.bot.sendMessage(msg.chat.id, `Your city has been set to ${city}. Use /weather to get the weather update.`);
      });
  
      this.bot.onText(/\/weather/, async (msg) => {
        if (this.blockedUsers.has(msg.chat.id)) {
          this.bot.sendMessage(msg.chat.id, 'You are blocked by Admin.');
          return;
        }
        const city = this.userCities.get(msg.chat.id);
        if (city) {
          try {
            const weather = await this.weatherService.getWeather(city);
            this.bot.sendMessage(msg.chat.id, weather);
          } catch (error) {
            this.bot.sendMessage(msg.chat.id, 'Sorry, I could not fetch the weather update at the moment.');
          }
        } else {
          this.bot.sendMessage(msg.chat.id, 'Please set your city first using /setcity <city_name>.');
        }
      });
    }
  
    @Cron('13 22 * * *') // Cron job to send daily weather updates
    async handleDailyWeatherUpdates() {
      this.subscribedUsers.forEach(async (userId) => {
        const city = this.userCities.get(userId);
        if (city) {
          try {
            const weather = await this.weatherService.getWeather(city);
            this.bot.sendMessage(userId, `Daily weather update for ${city}: ${weather}`);
          } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error);
            this.bot.sendMessage(userId, `Sorry, I couldn't fetch the weather update for ${city}.`);
          }
        }
      });
    }
  

    getSubscribedUsers(): { userId: number, username: string }[] {
        const users: { userId: number, username: string }[] = [];
        console.log('Current subscribed users:', Array.from(this.subscribedUsers));
        this.subscribedUsers.forEach((userId) => {
          const username = this.usernames.get(userId) || 'Unknown';
          users.push({ userId, username });
        });
        return users;
      }
     
      deleteUser(userId: number) {
        if (this.subscribedUsers.has(userId)) {
          this.subscribedUsers.delete(userId); // Remove from the Set
          this.usernames.delete(userId); // Remove from the Map
          this.userCities.delete(userId);
          console.log(`User ${userId} removed successfully.`);
          return { message: `User ${userId} deleted successfully.` };
        } else {
          console.log(`User ${userId} not found in the subscribed list.`);
          return { message: `User ${userId} not found.` };
        }
      }

  private blockedUsers: Set<number> = new Set();

  blockUser(userId: number): { message: string } {
    if (this.blockedUsers.has(userId)) {
      return { message: `User ${userId} is already blocked.` };
    }
    this.blockedUsers.add(userId);
    this.subscribedUsers.delete(userId);
    this.usernames.delete(userId);
    return { message: `User ${userId} has been blocked successfully.` };
  }
}

