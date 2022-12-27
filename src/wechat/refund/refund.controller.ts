// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { RefundDto, RefundService } from '..';

@Controller('wechat/refund')
export class RefundController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param merchantService 注入的商家服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly refundService: RefundService,
  ) {
    const main = {
      pid: 640,
      moduleName: '微信',
      objectName: '退款',
      type: '接口',
    };
    // 商家管理
    [
      { id: 642, name: '退款列表', description: '退款列表' },
      { id: 643, name: '退款详情', description: '退款详情' },
      { id: 645, name: '创建退款', description: '创建退款' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取退款清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(642)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.refundService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取退款详情
   * @param refund_id 退款单ID
   * @param res 响应上下文
   */
  @Get(':refund_id/show')
  @Abilities(643)
  async show(
    @Param('refund_id') refund_id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.refundService.show(refund_id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建退款
   * @param value 提交的退款信息
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(645)
  async create(@Body() value: RefundDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.refundService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
