// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { WxworkService, SettingController } from '.';

@Module({
  imports: [HttpModule, SharedModule, AuthModule],
  providers: [WxworkService],
  controllers: [SettingController],
  exports: [WxworkService],
})
export class WxworkModule {}
