// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { PassportService, PassportController } from '.';

/**认证模块 */
@Module({
  imports: [HttpModule, SharedModule],
  controllers: [PassportController],
  providers: [PassportService],
})
export class PassportModule {}
