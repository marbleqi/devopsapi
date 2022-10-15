// 外部依赖
import { Module } from '@nestjs/common';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { SettingController } from '.';

@Module({
  imports: [SharedModule],
  controllers: [SettingController],
})
export class SysModule {}
