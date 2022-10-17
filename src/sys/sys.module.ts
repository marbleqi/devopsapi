// 外部依赖
import { Module } from '@nestjs/common';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { SettingController } from '.';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [SettingController],
})
export class SysModule {}
