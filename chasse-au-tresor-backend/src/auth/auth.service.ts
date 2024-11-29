/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../admin/schemas/admin.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnModuleInit {
  readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeAdmin();
  }

  // Initialiser un administrateur par défaut
  private async initializeAdmin() {
    const adminData = this.configService.get<string>('DEFAULT_ADMINS');
    if (!adminData) {
      this.logger.error('No admin data found');
      return;
    }
    const admins = JSON.parse(adminData); // Parse JSON string

    for (const admin of admins) {
      const adminExists = await this.adminModel.exists({
        username: admin.username,
      });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        const newAdmin = new this.adminModel({
          username: admin.username,
          password: hashedPassword,
        });
        await newAdmin.save();
        this.logger.log(`Admin créé : ${admin.username}`);
      } else {
        this.logger.log(`Admin déjà existant : ${admin.username}`);
      }
    }
  }

  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = await this.adminModel.findOne({ username }).exec();
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password, ...result } = admin.toObject();
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async isAdmin(username: string): Promise<boolean> {
    const regex = new RegExp(`^${username}$`, 'ig');
    const admin = await this.adminModel.findOne({ username: regex }).exec();

    return admin !== null;
  }

  async login(admin: any) {
    const payload = { username: admin.username, sub: admin._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
