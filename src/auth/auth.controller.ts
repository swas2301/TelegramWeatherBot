
import { Controller, Get, Res, UseGuards, Render, Delete, Param, Post} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';  // Import Response to handle redirects
import { AdminService } from '../admin/admin.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly adminService: AdminService) {}
  @Get('google')
  @UseGuards(AuthGuard('google')) // Initiates Google Login
  googleAuth() {
    return; // Passport will handle the flow and redirect to Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
   // Handles Google callback
  @Render('admin')  // Render the 'admin' view (admin.hbs)
  
  googleAuthRedirect(@Res() res: Response) {
 //   const user = req.user;
 
    try {
      // After successful login, render the admin page with the user data
      const subscribedUsers = this.adminService.getSubscribedUsers();  // Get the subscribed users from AdminService
    return {
      title: 'Admin Panel',
      subscribedUsers,  // Pass the list of subscribed users to the view
    };
    } catch (error) {
      console.error('Error during Google authentication redirect:', error);
      // You could render an error page or return an appropriate response
      res.status(500).send('Error during Google authentication');
    }
  }


  @Delete('/delete/:userId')
deleteUser(@Param('userId') userId: string) {
  return this.adminService.deleteUser(Number(userId));
}

@Post('/block/:userId')
  blockUser(@Param('userId') userId: string) {
    return this.adminService.blockUser(Number(userId));
  }

}

