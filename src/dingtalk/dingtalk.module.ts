// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { DingtalkService, SettingController } from '.';

@Module({
  imports: [HttpModule, SharedModule, AuthModule],
  providers: [DingtalkService],
  controllers: [SettingController],
  exports: [DingtalkService],
})
export class DingtalkModule {}
