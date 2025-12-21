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
}
