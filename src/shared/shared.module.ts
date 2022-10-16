// 外部依赖
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import {
  ReqEntity,
  SettingEntity,
  SettingLogEntity,
  RedisService,
  CommonService,
  ReqService,
  SettingService,
} from '.';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ReqEntity, SettingEntity, SettingLogEntity]),
  ],
  providers: [RedisService, CommonService, ReqService, SettingService],
  exports: [RedisService, CommonService, ReqService, SettingService],
})
export class SharedModule {}
