// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  KongHostEntity,
  KongHostLogEntity,
  KongGrantEntity,
  KongGrantLogEntity,
  KongProjectEntity,
  KongProjectLogEntity,
  HostService,
  KongService,
  GrantService,
  ProjectService,
  TargetService,
  PluginService,
  HostController,
  GrantController,
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
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      KongHostEntity,
      KongHostLogEntity,
      KongGrantEntity,
      KongGrantLogEntity,
      KongProjectEntity,
      KongProjectLogEntity,
    ]),
  ],
  providers: [
    HostService,
    GrantService,
    KongService,
    TargetService,
    PluginService,
    ProjectService,
  ],
  controllers: [
    HostController,
    GrantController,
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
