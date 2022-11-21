import { Module } from '@nestjs/common';
import { WechatService } from './wechat.service';
import { CompanyService } from './company/company.service';
import { CompanyController } from './company/company.controller';
import { ComplaintController } from './complaint/complaint.controller';
import { ComplaintService } from './complaint/complaint.service';
import { OrderService } from './order/order.service';
import { OrderController } from './order/order.controller';
import { RefundController } from './refund/refund.controller';
import { RefundService } from './refund/refund.service';

@Module({
  providers: [WechatService, CompanyService, ComplaintService, OrderService, RefundService],
  controllers: [CompanyController, ComplaintController, OrderController, RefundController]
})
export class WechatModule {}
