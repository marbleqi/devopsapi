// 外部依赖
import { Module } from '@nestjs/common';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  SysService,
  SettingController,
  ReqController,
  QueueController,
} from '.';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [SettingController, ReqController, QueueController],
  providers: [SysService],
})
export class SysModule {}
