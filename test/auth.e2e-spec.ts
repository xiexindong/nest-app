import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DatabaseService } from './../src/services/database.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    await app.init();

    // 在测试前准备测试数据
    await prepareTestData(databaseService);
  });

  afterEach(async () => {
    // 在测试后清理测试数据
    await cleanupTestData(databaseService);
    await app.close();
  });

  it('should login successfully and return tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.user.username).toBe('testuser');
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body.message).toBe('用户名或密码错误');
  });

  it('should verify token successfully', async () => {
    // 首先登录获取令牌
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    const accessToken = loginResponse.body.data.accessToken;

    // 然后验证令牌
    const verifyResponse = await request(app.getHttpServer())
      .post('/auth/verify-token')
      .send({
        token: accessToken,
      })
      .expect(200);

    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.data.user.username).toBe('testuser');
  });

  it('should refresh token successfully', async () => {
    // 首先登录获取令牌
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    const refreshToken = loginResponse.body.data.refreshToken;

    // 然后使用刷新令牌获取新的访问令牌
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({
        refreshToken: refreshToken,
      })
      .expect(200);

    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.data.accessToken).toBeDefined();
    expect(refreshResponse.body.data.refreshToken).toBeDefined();
  });

  it('should fail to access protected route without token', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .expect(401); // 假设/users需要认证
  });

  // 准备测试数据的辅助函数
  async function prepareTestData(database: DatabaseService): Promise<void> {
    // 清理可能存在的测试数据
    await database.executeCommand('DELETE FROM users WHERE username = ?', ['testuser']);
    
    // 创建测试用户
    await database.executeCommand(
      `INSERT INTO users (username, password, email, name, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'testuser',
        'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // 'password123' hashed
        'test@example.com',
        'Test User',
        'user',
      ],
    );
  }

  // 清理测试数据的辅助函数
  async function cleanupTestData(database: DatabaseService): Promise<void> {
    await database.executeCommand('DELETE FROM users WHERE username = ?', ['testuser']);
  }
});
