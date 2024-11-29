import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // this.logger.debug(`login()`);
    // this.logger.debug(body);
    const admin = await this.authService.validateAdmin(body.username, body.password);
    return this.authService.login(admin);
  }
}
