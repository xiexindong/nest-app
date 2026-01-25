// 导入Role类型以避免循环依赖
import { Role } from './role.model';

export class User {
  id: number;
  username: string;
  password: string;
  email: string;
  name: string;
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles?: Role[]; // 多对多关系
}
