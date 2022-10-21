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
  UserController,
  WxworkService,
  SettingController,
} from '.';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([WxworkUserEntity, WxworkUserLogEntity]),
  ],
  providers: [WxworkService, UserService],
  controllers: [SettingController, UserController],
  exports: [WxworkService, UserService],
})
export class WxworkModule {}
