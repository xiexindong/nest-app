import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { DatabaseService } from './services/database.service';

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
  ],
  controllers: [AppController, UserController, AuthController],
  providers: [AppService, UserService, DatabaseService],
})
export class AppModule {}
