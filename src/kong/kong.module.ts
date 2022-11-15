// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  KongService,
  KongHostEntity,
  KongHostLogEntity,
  KongProjectEntity,
  KongProjectLogEntity,
  HostService,
  ProjectService,
  TargetService,
  PluginService,
  HostController,
  TargetController,
  ConsumerController,
  ServiceController,
  CertificateController,
  RouteController,
  PluginController,
  UpstreamController,
} from '.';
import {} from './project/project.service';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      KongHostEntity,
      KongHostLogEntity,
      KongProjectEntity,
      KongProjectLogEntity,
    ]),
  ],
  providers: [
    HostService,
    KongService,
    TargetService,
    PluginService,
    ProjectService,
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
