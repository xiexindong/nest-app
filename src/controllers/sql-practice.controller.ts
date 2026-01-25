import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { DatabaseService } from '../services/database.service';

@ApiTags('sql-practice')
@Controller('sql-practice')
export class SqlPracticeController {
  private readonly logger = new Logger(SqlPracticeController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * 执行SQL查询
   * 仅用于开发环境的SQL练习
   */
  @Post('query')
  @ApiOperation({ summary: '执行SQL查询' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL查询语句' },
        params: {
          type: 'array',
          items: { type: 'any' },
          description: '查询参数',
        },
      },
      required: ['sql'],
    },
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 400, description: 'SQL语句不能为空' })
  @ApiResponse({ status: 403, description: '仅在开发环境可用' })
  @ApiResponse({ status: 500, description: 'SQL执行失败' })
  async executeQuery(@Body() body: { sql: string; params?: any[] }) {
    const { sql, params = [] } = body;

    if (!sql) {
      throw new HttpException('SQL语句不能为空', HttpStatus.BAD_REQUEST);
    }

    // 检查环境，仅在开发环境允许执行
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpException('此接口仅在开发环境可用', HttpStatus.FORBIDDEN);
    }

    // 防止执行危险操作
    const lowerSql = sql.toLowerCase();
    if (
      lowerSql.includes('drop') ||
      lowerSql.includes('truncate') ||
      lowerSql.includes('delete') ||
      lowerSql.includes('update') ||
      lowerSql.includes('insert')
    ) {
      throw new HttpException(
        '此接口仅允许执行SELECT查询',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`执行SQL查询: ${sql}`, params);
      const result = await this.databaseService.executeQuery(sql, params);
      return {
        success: true,
        message: '查询成功',
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`SQL执行失败: ${sql}`, errorStack);
      throw new HttpException(
        `SQL执行失败: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 执行SQL命令（INSERT/UPDATE/DELETE）
   * 仅用于开发环境的SQL练习
   */
  @Post('command')
  @ApiOperation({ summary: '执行SQL命令' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL命令语句' },
        params: {
          type: 'array',
          items: { type: 'any' },
          description: '命令参数',
        },
      },
      required: ['sql'],
    },
  })
  @ApiResponse({ status: 200, description: '命令执行成功' })
  @ApiResponse({ status: 400, description: 'SQL语句不能为空' })
  @ApiResponse({ status: 403, description: '仅在开发环境可用' })
  @ApiResponse({ status: 500, description: 'SQL执行失败' })
  async executeCommand(@Body() body: { sql: string; params?: any[] }) {
    const { sql, params = [] } = body;

    if (!sql) {
      throw new HttpException('SQL语句不能为空', HttpStatus.BAD_REQUEST);
    }

    // 检查环境，仅在开发环境允许执行
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpException('此接口仅在开发环境可用', HttpStatus.FORBIDDEN);
    }

    try {
      this.logger.log(`执行SQL命令: ${sql}`, params);
      const result = await this.databaseService.executeCommand(sql, params);
      return {
        success: true,
        message: '命令执行成功',
        data: {
          affectedRows: result,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`SQL执行失败: ${sql}`, errorStack);
      throw new HttpException(
        `SQL执行失败: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取SQL练习示例
   */
  @Get('examples')
  @ApiOperation({ summary: '获取SQL练习示例' })
  @ApiQuery({ name: 'category', required: false, description: '示例类别' })
  @ApiResponse({ status: 200, description: '获取示例成功' })
  getSqlExamples(@Query('category') category?: string) {
    const examples = {
      basic: [
        {
          name: '查询所有用户',
          sql: 'SELECT * FROM users',
          description: '查询users表中的所有记录',
        },
        {
          name: '根据ID查询用户',
          sql: 'SELECT * FROM users WHERE id = ?',
          params: [1],
          description: '根据ID查询特定用户',
        },
        {
          name: '查询用户总数',
          sql: 'SELECT COUNT(*) as total FROM users',
          description: '统计users表中的记录数',
        },
      ],
      advanced: [
        {
          name: '按角色分组统计用户数',
          sql: 'SELECT role, COUNT(*) as count FROM users GROUP BY role',
          description: '按role字段分组并统计每组的用户数',
        },
        {
          name: '查询创建时间在指定日期之后的用户',
          sql: 'SELECT * FROM users WHERE createdAt > ?',
          params: ['2024-01-01'],
          description: '查询2024年1月1日之后创建的用户',
        },
        {
          name: '按创建时间倒序查询用户',
          sql: 'SELECT * FROM users ORDER BY createdAt DESC',
          description: '按创建时间降序排列查询结果',
        },
      ],
      performance: [
        {
          name: '使用LIMIT限制查询结果',
          sql: 'SELECT * FROM users LIMIT 10',
          description: '仅返回前10条记录，提高查询性能',
        },
        {
          name: '只查询需要的字段',
          sql: 'SELECT id, username, name FROM users',
          description: '仅查询必要的字段，减少数据传输量',
        },
        {
          name: '使用索引字段进行查询',
          sql: 'SELECT * FROM users WHERE username = ?',
          params: ['admin'],
          description: '使用username字段（有唯一索引）进行查询',
        },
      ],
    };

    if (category && examples[category]) {
      return {
        success: true,
        message: `获取${category}类别的SQL示例成功`,
        data: examples[category as keyof typeof examples],
      };
    }

    return {
      success: true,
      message: '获取SQL示例成功',
      data: examples,
    };
  }

  /**
   * 数据库表结构信息
   */
  @Get('schema')
  @ApiOperation({ summary: '获取数据库表结构信息' })
  @ApiResponse({ status: 200, description: '获取表结构成功' })
  async getDatabaseSchema() {
    try {
      // 查询数据库中的所有表
      const tables =
        await this.databaseService.executeQuery<any>('SHOW TABLES');

      const schemaInfo: Array<{ tableName: string; columns: any[] }> = [];

      // 查询每个表的结构
      for (const tableRow of tables) {
        // 获取表名（处理不同MySQL客户端返回的不同格式）
        const tableName = Object.values(tableRow)[0];
        if (tableName && typeof tableName === 'string') {
          const columns = await this.databaseService.executeQuery<any>(
            `DESCRIBE ${tableName}`,
          );
          schemaInfo.push({
            tableName: tableName,
            columns: columns,
          });
        }
      }

      return {
        success: true,
        message: '获取数据库表结构成功',
        data: schemaInfo,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('获取数据库表结构失败', errorStack);
      throw new HttpException(
        `获取表结构失败: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
