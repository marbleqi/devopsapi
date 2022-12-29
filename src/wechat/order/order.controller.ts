// 外部依赖
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { OrderService } from '..';

@Controller('wechat/order')
export class OrderController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param OrderService 注入的订单服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly orderService: OrderService,
  ) {
    const main = {
      pid: 630,
      moduleName: '微信',
      objectName: '订单',
      type: '接口',
    };
    // 商家管理
    [{ id: 633, name: '订单详情', description: '订单详情' }].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取订单详情
   * @param mchid 商家微信ID
   * @param res 响应上下文
   */
  @Get(':mchid/show')
  @Abilities(633)
  async show(
    @Param('mchid') mchid: string,
    @Query('order_type') orderType: 'out_trade_no' | 'transaction_id',
    @Query('order_id') orderId: string,
    @Res() res: Response,
  ): Promise<void> {
    console.debug('订单信息', mchid, orderType, orderId);
    res.locals.result = await this.orderService.show({
      mchid,
      orderType,
      orderId,
    });
    res.status(200).json(res.locals.result);
  }
}
