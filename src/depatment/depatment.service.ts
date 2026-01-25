import { Injectable } from '@nestjs/common';

@Injectable()
export class DepatmentService {
  getAllDepartments(): string {
    return '获取所有的部门';
  }
}
