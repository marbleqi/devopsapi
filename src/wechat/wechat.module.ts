import { Module } from '@nestjs/common';
import {
  CompanyService,
  ComplaintService,
  OrderService,
  RefundService,
  WechatService,
  CompanyController,
  ComplaintController,
  OrderController,
  RefundController,
} from '.';
import { MerchantController } from './merchant/merchant.controller';
import { MerchantService } from './merchant/merchant.service';

@Module({
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
