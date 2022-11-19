// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

import {
  AliyunAccesskeyEntity,
  AliyunAccesskeyLogEntity,
  AccesskeyService,
  AliyunService,
  DomainService,
  EcsService,
  DnsService,
  CmsService,
  CrService,
  CasService,
  AccesskeyController,
  DomainController,
  EcsController,
  DnsController,
  CmsController,
  CrController,
  CasController,
} from '.';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([AliyunAccesskeyEntity, AliyunAccesskeyLogEntity]),
  ],
  controllers: [
    AccesskeyController,
    DomainController,
    EcsController,
    DnsController,
    CmsController,
    CrController,
    CasController,
  ],
  providers: [
    AccesskeyService,
    DomainService,
    EcsService,
    DnsService,
    CmsService,
    CrService,
    CasService,
    AliyunService,
  ],
})
export class AliyunModule {}
