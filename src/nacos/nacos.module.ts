import { Module } from '@nestjs/common';
import { HostService } from './host/host.service';
import { HostController } from './host/host.controller';

@Module({
  providers: [HostService],
  controllers: [HostController],
})
export class NacosModule {}
