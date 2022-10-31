// 外部依赖
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

import {
  KongService,
  KongHostEntity,
  KongHostLogEntity,
  HostService,
  HostController,
  TargetService,
  UpstreamService,
  PluginService,
  CertificateService,
  ConsumerService,
  ServiceService,
  RouteService,
  TargetController,
  ConsumerController,
  ServiceController,
  CertificateController,
  RouteController,
  PluginController,
  UpstreamController,
} from '.';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([KongHostEntity, KongHostLogEntity]),
  ],
  providers: [
    HostService,
    KongService,
    RouteService,
    ServiceService,
    ConsumerService,
    CertificateService,
    UpstreamService,
    TargetService,
    PluginService,
  ],
  controllers: [
    HostController,
    RouteController,
    ServiceController,
    ConsumerController,
    CertificateController,
    UpstreamController,
    TargetController,
    PluginController,
  ],
})
export class KongModule {}
