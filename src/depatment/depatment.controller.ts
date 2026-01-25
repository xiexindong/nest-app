import { Controller, Get, Query } from '@nestjs/common';
import { DepatmentService } from '../services/depatment.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { Department } from '../entities/department.entity';

@Controller('depatment')
export class DepatmentController {
  constructor(private readonly depatmentService: DepatmentService) {}
  @ApiTags('部门')
  @Get()
  @ApiQuery({ name: 'id', required: false, description: '部门ID' })
  getAllDepartments(@Query('id') id?: number): Promise<Department[]> {
    return this.depatmentService.getAllDepartments(id);
  }
}
