// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  WxworkUserEntity,
  WxworkUserLogEntity,
  UserService,
  CheckinService,
  WxworkService,
  UserController,
  SettingController,
  CheckinController,
} from '.';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([WxworkUserEntity, WxworkUserLogEntity]),
  ],
  providers: [WxworkService, UserService, CheckinService],
  controllers: [SettingController, UserController, CheckinController],
  exports: [WxworkService, UserService],
})
export class WxworkModule {}
