import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * 执行SELECT查询
   * @param sql SQL查询语句
   * @param params 参数数组
   * @returns 查询结果数组
   */
  async executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    this.logger.log(`执行查询: ${sql}`, params);
    const queryRunner = this.connection.createQueryRunner();
    
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(sql, params);
      return result;
    } catch (error) {
      this.logger.error(`查询失败: ${sql}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 执行INSERT/UPDATE/DELETE命令
   * @param sql SQL命令语句
   * @param params 参数数组
   * @returns 受影响的行数或插入的ID
   */
  async executeCommand(sql: string, params: any[] = []): Promise<number> {
    this.logger.log(`执行命令: ${sql}`, params);
    const queryRunner = this.connection.createQueryRunner();
    
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(sql, params);
      
      // 根据数据库类型返回适当的结果
      if (result && result.insertId) {
        return result.insertId;
      }
      if (result && result.affectedRows) {
        return result.affectedRows;
      }
      return 1; // 默认成功返回1
    } catch (error) {
      this.logger.error(`命令执行失败: ${sql}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 开始事务
   * @returns 查询运行器
   */
  async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }
}
