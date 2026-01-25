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
      // query()方法不接受类型参数，返回QueryResult类型
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const queryResult = await queryRunner.query(sql, params);

      // 从QueryResult中提取rows属性，处理不同数据库驱动的差异
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const rows =
        'rows' in (queryResult as Record<string, unknown>)
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            queryResult.rows
          : queryResult;
      return rows as T[];
    } catch (error) {
      this.logger.error(`查询失败: ${sql}`, (error as Error).stack);
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
      // query()方法不接受类型参数，返回QueryResult类型
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const queryResult = await queryRunner.query(sql, params);
      const result = queryResult as Record<string, unknown>;

      // 使用结果对象，确保返回明确的number类型
      if (result?.insertId !== undefined) {
        return Number(result.insertId);
      }
      // TypeORM QueryResult使用affected而不是affectedRows
      if (result?.affected !== undefined) {
        return Number(result.affected);
      }
      if (result?.affectedRows !== undefined) {
        return Number(result.affectedRows);
      }
      return 1; // 默认成功返回1
    } catch (error) {
      this.logger.error(`命令执行失败: ${sql}`, (error as Error).stack);
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

  /**
   * 提交事务
   * @param queryRunner 查询运行器
   */
  async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  /**
   * 回滚事务
   * @param queryRunner 查询运行器
   */
  async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }

  /**
   * 释放查询运行器
   * @param queryRunner 查询运行器
   */
  async releaseQueryRunner(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.isReleased === false) {
      await queryRunner.release();
    }
  }

  /**
   * 在事务中执行操作
   * @param operation 要执行的操作函数
   * @returns 操作结果
   */
  async transaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = await this.startTransaction();
    try {
      const result = await operation(queryRunner);
      await this.commitTransaction(queryRunner);
      return result;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      this.logger.error(
        `事务执行失败: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
