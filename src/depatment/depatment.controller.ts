import { Controller, Get } from '@nestjs/common';
import { DepatmentService } from './depatment.service';

@Controller('depatment')
export class DepatmentController {
  constructor(private readonly depatmentService: DepatmentService) {}

  @Get()
  getAllDepartments(): string {
    return this.depatmentService.getAllDepartments();
  }
}
