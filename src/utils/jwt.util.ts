/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import * as jwt from 'jsonwebtoken';

// 在实际应用中，这些应该从环境变量中获取
const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
  sub: number; // 用户ID
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  /**
   * 生成JWT令牌
   */
  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return token;
    } catch (error) {
      console.error('JWT token generation error:', error);
      throw new Error('生成令牌失败');
    }
  }

  /**
   * 验证JWT令牌
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    } catch (error) {
      console.error('JWT token verification error:', error);
      throw new Error('无效的令牌');
    }
  }

  /**
   * 解码JWT令牌（不验证）
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as unknown as JwtPayload;
    } catch (error) {
      console.error('JWT token decode error:', error);
      return null;
    }
  }
}