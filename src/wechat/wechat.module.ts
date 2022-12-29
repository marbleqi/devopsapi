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
  WechatRefundEntity,
  CompanyService,
  MerchantService,
  WechatService,
  OrderService,
  RefundService,
  ComplaintService,
  CompanyController,
  MerchantController,
  OrderController,
  RefundController,
  ComplaintController,
} from '.';

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
      WechatRefundEntity,
    ]),
  ],
  providers: [
    CompanyService,
    MerchantService,
    WechatService,
    OrderService,
    RefundService,
    ComplaintService,
  ],
  controllers: [
    CompanyController,
    MerchantController,
    OrderController,
    RefundController,
    ComplaintController,
  ],
})
export class WechatModule {}
