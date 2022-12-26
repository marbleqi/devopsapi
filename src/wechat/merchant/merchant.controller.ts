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
import { MerchantDto, MerchantService } from '..';

@Controller('wechat/merchant')
export class MerchantController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param merchantService 注入的商家服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly merchantService: MerchantService,
  ) {
    const main = {
      pid: 620,
      moduleName: '微信',
      objectName: '商家',
      type: '接口',
    };
    // 商家管理
    [
      { id: 622, name: '商家列表', description: '商家列表' },
      { id: 623, name: '商家详情', description: '商家详情' },
      { id: 624, name: '商家变更历史', description: '商家变更历史' },
      { id: 625, name: '创建商家', description: '创建商家' },
      { id: 626, name: '修改商家', description: '修改商家' },
      { id: 627, name: '商家排序', description: '商家排序' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取商家清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(622)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.merchantService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取商家详情
   * @param mchid 商家微信ID
   * @param res 响应上下文
   */
  @Get(':mchid/show')
  @Abilities(623)
  async show(
    @Param('mchid') mchid: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.merchantService.show(mchid);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取商家变更日志
   * @param mchid 商家微信ID
   * @param res 响应上下文
   */
  @Get(':mchid/log')
  @Abilities(624)
  async log(
    @Param('mchid') mchid: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.merchantService.log(mchid);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建商家
   * @param value 提交的商家信息
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(625)
  async create(
    @Body() value: MerchantDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.merchantService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新商家（含禁用和启用商家）
   * @param hostId 商家ID
   * @param value 提交的商家信息
   * @param res 响应上下文
   */
  @Post(':mchid/update')
  @Abilities(626)
  async update(
    @Param('mchid') mchid: string,
    @Body() value: MerchantDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.merchantService.update(
      mchid,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 商家排序
   * @param value 提交的排序信息
   * @param res 响应上下文
   */
  @Post('sort')
  @Abilities(627)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.merchantService.sort(value);
    res.status(200).json(res.locals.result);
  }
}
