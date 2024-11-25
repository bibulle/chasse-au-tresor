import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // console.log('body', body);
    const admin = await this.authService.validateAdmin(
      body.username,
      body.password,
    );
    return this.authService.login(admin);
  }
}
