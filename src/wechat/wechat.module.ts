// 外部依赖
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  WechatCompanyEntity,
  WechatCompanyLogEntity,
  WechatMerchantEntity,
  WechatMerchantLogEntity,
  CompanyService,
  MerchantService,
  ComplaintService,
  OrderService,
  RefundService,
  WechatService,
  CompanyController,
  MerchantController,
  ComplaintController,
  OrderController,
  RefundController,
} from '.';
import {} from './merchant/merchant.controller';
import {} from './merchant/merchant.service';

@Module({
  imports: [
    HttpModule,
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([
      WechatCompanyEntity,
      WechatCompanyLogEntity,
      WechatMerchantEntity,
      WechatMerchantLogEntity,
    ]),
  ],
  providers: [
    WechatService,
    CompanyService,
    ComplaintService,
    OrderService,
    RefundService,
    MerchantService,
  ],
  controllers: [
    CompanyController,
    ComplaintController,
    OrderController,
    RefundController,
    MerchantController,
  ],
})
export class WechatModule {}
