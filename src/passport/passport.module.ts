// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { DingtalkModule } from '../dingtalk/dingtalk.module';
import { WxworkModule } from '../wxwork/wxwork.module';
import { PassportService, PassportController } from '.';

/**认证模块 */
@Module({
  imports: [HttpModule, SharedModule, DingtalkModule, WxworkModule],
  controllers: [PassportController],
  providers: [PassportService],
})
export class PassportModule {}
