import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Authorization Header:', req.headers.authorization);

    // Periksa apakah header Authorization ada
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Header Authorization tidak ditemukan');
    }

    // Periksa format header Authorization
    if (!req.headers.authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Format token tidak valid, harus menggunakan format: Bearer [token]',
      );
    }

    const token = req.headers.authorization.split(' ')[1];
    console.log('Extracted Token length:', token ? token.length : 0);

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      const secret = process.env.JWT_SECRET || 'rahasia';
      console.log('Using JWT secret with length:', secret.length);

      const decoded = jwt.verify(token, secret) as { type: string };
      console.log('Token successfully verified');
      console.log('Token type:', decoded.type);

      if (decoded.type !== 'video-access') {
        throw new UnauthorizedException(
          'Token tidak memiliki akses yang sesuai',
        );
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token telah kadaluarsa');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          'Format token tidak valid: ' + error.message,
        );
      } else {
        throw new UnauthorizedException(
          'Error validasi token: ' + error.message,
        );
      }
    }
  }
}
