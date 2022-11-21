import { Module } from '@nestjs/common';
import { HostService } from './host/host.service';
import { HostController } from './host/host.controller';
import { NacosService } from './nacos.service';
import { NamespaceService } from './namespace/namespace.service';
import { NamespaceController } from './namespace/namespace.controller';
import { ConfigController } from './config/config.controller';
import { ConfigService } from './config/config.service';
import { InstanceService } from './instance/instance.service';
import { InstanceController } from './instance/instance.controller';
import { ServiceController } from './service/service.controller';
import { ServiceService } from './service/service.service';

@Module({
  providers: [HostService, NacosService, NamespaceService, ConfigService, InstanceService, ServiceService],
  controllers: [HostController, NamespaceController, ConfigController, InstanceController, ServiceController],
})
export class NacosModule {}
