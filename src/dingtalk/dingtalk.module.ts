// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  DingtalkUserEntity,
  DingtalkUserLogEntity,
  UserService,
  UserController,
  DingtalkService,
  SettingController,
} from '.';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([DingtalkUserEntity, DingtalkUserLogEntity]),
  ],
  providers: [DingtalkService, UserService],
  controllers: [SettingController, UserController],
  exports: [DingtalkService, UserService],
})
export class DingtalkModule {}
