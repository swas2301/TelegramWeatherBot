import { Controller, Get, UseGuards, Render, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport'; // Protects the route with Google OAuth

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  

  @Get()
  @UseGuards(AuthGuard('google'))  // Protect the route with Google OAuth
  @Render('admin')  // Render the admin panel view
  getAdminPanel() {
   
    return;
  }

  @Post('update-api-key')
  async updateApiKey(@Body() body: { apiKey: string }) {
    try {
      await this.adminService.updateApiKey(body.apiKey);
      return { message: 'API key updated successfully!' };
    } catch (error) {
      return { message: error.message || 'Failed to update API key' };
    }
  }
}
