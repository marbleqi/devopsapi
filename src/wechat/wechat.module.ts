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

@Module({
  providers: [
    WechatService,
    CompanyService,
    ComplaintService,
    OrderService,
    RefundService,
  ],
  controllers: [
    CompanyController,
    ComplaintController,
    OrderController,
    RefundController,
  ],
})
export class WechatModule {}
