import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepatmentService {
  constructor(private readonly databaseService: DatabaseService) {}
  async getAllDepartments(id?: number | number[]): Promise<Department[]> {
    let query = 'select * from departments';
    const params: any[] = [];
    if (Array.isArray(id)) {
      query += ' WHERE id IN (?)';
      params.push(id);
    } else if (id) {
      query += ' WHERE id = ?';
      params.push(id);
    }

    const result: Department[] = await this.databaseService.executeQuery(
      query,
      params,
    );
    return result.map((row: Department) => ({
      id: row.id,
      name: row.name,
    }));
  }
}
