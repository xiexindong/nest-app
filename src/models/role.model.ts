// 导入User类型
import { User } from './user.model';

export class Role {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  users?: User[]; // 多对多关系
}

export class UserRole {
  userId: number;
  roleId: number;
  createdAt: Date;
}