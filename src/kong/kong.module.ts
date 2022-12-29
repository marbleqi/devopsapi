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
  KongLogEntity,
  KongLogCountEntity,
  KongLogYearEntity,
  KongLogMonthEntity,
  KongLogDayEntity,
  KongLogHourEntity,
  KongLogMinuteEntity,
  HostService,
  KongService,
  GrantService,
  ProjectService,
  TargetService,
  PluginService,
  LogService,
  HostController,
  GrantController,
  TargetController,
  ConsumerController,
  ServiceController,
  CertificateController,
  RouteController,
  PluginController,
  UpstreamController,
  LogController,
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
      KongLogEntity,
      KongLogCountEntity,
      KongLogYearEntity,
      KongLogMonthEntity,
      KongLogDayEntity,
      KongLogHourEntity,
      KongLogMinuteEntity,
    ]),
  ],
  providers: [
    HostService,
    GrantService,
    KongService,
    TargetService,
    PluginService,
    ProjectService,
    LogService,
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
    LogController,
  ],
})
export class KongModule {}
