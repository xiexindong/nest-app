/* eslint-disable prettier/prettier */
import * as jwt from 'jsonwebtoken';

// 在实际应用中，这些应该从环境变量中获取
const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_SECRET = 'your-refresh-secret-key';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JwtPayload {
  sub: number; // 用户ID
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: number; // 用户ID
  jti: string; // 令牌ID
  iat?: number;
  exp?: number;
}

export class JwtService {
  /**
   * 生成JWT访问令牌
   */
  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
      return token;
    } catch (error) {
      console.error('JWT token generation error:', error);
      throw new Error('生成令牌失败');
    }
  }

  /**
   * 生成JWT刷新令牌
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
      return token;
    } catch (error) {
      console.error('Refresh token generation error:', error);
      throw new Error('生成刷新令牌失败');
    }
  }

  /**
   * 验证JWT访问令牌
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    } catch (error) {
      console.error('JWT token verification error:', error);
      throw new Error('无效的访问令牌');
    }
  }

  /**
   * 验证JWT刷新令牌
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as unknown as RefreshTokenPayload;
    } catch (error) {
      console.error('Refresh token verification error:', error);
      throw new Error('无效的刷新令牌');
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

  /**
   * 解码刷新令牌（不验证）
   */
  static decodeRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.decode(token) as unknown as RefreshTokenPayload;
    } catch (error) {
      console.error('Refresh token decode error:', error);
      return null;
    }
  }
}