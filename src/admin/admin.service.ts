import { Injectable } from '@nestjs/common';
import { BotService } from '../bot/bot.service';  // Import BotService
import * as fs from 'fs';
import * as dotenv from 'dotenv';

@Injectable()
export class AdminService {
  private readonly envFilePath = '.env'; // Path to your .env file

  constructor(private readonly botService: BotService) {
    // Load the environment variables
    dotenv.config();
  }
  // Method to retrieve subscribed users
  getSubscribedUsers(): { userId: number, username: string }[]{
    return this.botService.getSubscribedUsers();  // Call BotService to get the subscribed users
  }
  // Other admin-related methods (if any)
  deleteUser(userId: number) {
    return this.botService.deleteUser(userId);
  }

  blockUser(userId: number) {
    return this.botService.blockUser(userId);
  }
  async updateApiKey(newApiKey: string): Promise<void> {
    try {
      // Read the .env file
      process.env.TELEGRAM_BOT_TOKEN = newApiKey;

      // Update bot token in the bot service
      this.botService.updateBotToken(newApiKey);
    } catch (error) {
      throw new Error('Failed to update API key: ' + error.message);
    }
  }

}
