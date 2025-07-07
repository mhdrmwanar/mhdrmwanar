import * as jwt from 'jsonwebtoken';
import { User } from '../models/userModel';

class JwtService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your_secret_key';
    console.log('JwtService JWT_SECRET:', this.secretKey);
  }

  signToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email
    };
    return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default JwtService;
