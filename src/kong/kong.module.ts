import { Module } from '@nestjs/common';
import { KongService, HostService, HostController } from '.';
import { RouteController } from './route/route.controller';
import { RouteService } from './route/route.service';
import { ServiceService } from './service/service.service';
import { ServiceController } from './service/service.controller';
import { ConsumerController } from './consumer/consumer.controller';
import { ConsumerService } from './consumer/consumer.service';
import { CertificateService } from './certificate/certificate.service';
import { CertificateController } from './certificate/certificate.controller';
import { UpstreamController } from './upstream/upstream.controller';
import { UpstreamService } from './upstream/upstream.service';
import { TargetService } from './target/target.service';
import { TargetController } from './target/target.controller';
import { PluginController } from './plugin/plugin.controller';
import { PluginService } from './plugin/plugin.service';

@Module({
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
