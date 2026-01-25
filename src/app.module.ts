import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { SqlPracticeController } from './controllers/sql-practice.controller';
import { UserService } from './services/user.service';
import { DatabaseService } from './services/database.service';
import { ItemModule } from './modules/item/item.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'nest_app',
      entities: [],
      synchronize: false,
      logging: true,
    }),
    ItemModule,
  ],
  controllers: [
    AppController,
    UserController,
    AuthController,
    SqlPracticeController,
  ],
  providers: [AppService, UserService, DatabaseService],
})
export class AppModule {}
