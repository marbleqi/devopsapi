// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  KubernetesClusterEntity,
  KubernetesClusterLogEntity,
  ClusterService,
  KubernetesService,
  NodeService,
  NamespaceService,
  ConfigMapService,
  DeploymentService,
  StatefulSetService,
  PodService,
  ServiceService,
  VirtualServiceService,
  RuleGatewayService,
  ClusterController,
  NodeController,
  NamespaceController,
  ConfigMapController,
  DeploymentController,
  StatefulSetController,
  PodController,
  ServiceController,
  VirtualServiceController,
  RuleGatewayController,
} from '.';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      KubernetesClusterEntity,
      KubernetesClusterLogEntity,
    ]),
  ],
  providers: [
    KubernetesService,
    ClusterService,
    ConfigMapService,
    DeploymentService,
    NamespaceService,
    NodeService,
    PodService,
    ServiceService,
    StatefulSetService,
    VirtualServiceService,
    RuleGatewayService,
  ],
  controllers: [
    ClusterController,
    ConfigMapController,
    DeploymentController,
    NamespaceController,
    NodeController,
    PodController,
    ServiceController,
    StatefulSetController,
    VirtualServiceController,
    RuleGatewayController,
  ],
})
export class KubernetesModule {}
