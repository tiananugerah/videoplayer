import { Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('token')
  generateToken() {
    const payload = { type: 'video-access' };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}
