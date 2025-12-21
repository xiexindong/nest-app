import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { JwtService } from '../utils/jwt.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户登录接口
   */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    try {
      // 验证用户凭据
      const user = this.userService.validateUser(loginDto);
      if (!user) {
        throw new HttpException('用户名或密码错误', HttpStatus.UNAUTHORIZED);
      }
      // 生成JWT令牌
      const token = JwtService.generateToken({
        sub: user.id,
        username: user.username,
        role: user.role,
      });
      // 返回用户信息和令牌
      return {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('登录失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 忘记密码接口
   */
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const result =
        await this.userService.generateResetPasswordToken(forgotPasswordDto);

      // 为了安全，无论用户是否存在都返回相同的消息
      return {
        success: true,
        message:
          '如果该邮箱存在于我们的系统中，您将收到一封包含重置密码链接的邮件',
        // 在开发环境中返回令牌，生产环境中不应该返回
        ...(process.env.NODE_ENV === 'development' && result
          ? { token: result.token }
          : {}),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        '处理请求时出错',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 重置密码接口
   */
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const result = await this.userService.resetPassword(resetPasswordDto);

      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('重置密码失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 验证令牌接口
   */
  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }) {
    try {
      const { token } = body;
      if (!token) {
        throw new HttpException('令牌不能为空', HttpStatus.BAD_REQUEST);
      }
      const payload = JwtService.verifyToken(token);
      // 获取用户详细信息
      const user = await this.userService.getUserByIdSafe(payload.sub);
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: '令牌有效',
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('令牌无效', HttpStatus.UNAUTHORIZED);
    }
  }
}
