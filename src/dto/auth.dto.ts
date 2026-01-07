import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: '重置密码令牌' })
  token: string;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码' })
  currentPassword: string;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  newPassword: string;
}
