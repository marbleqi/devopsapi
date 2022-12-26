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
import { CompanyDto, CompanyService } from '..';

@Controller('wechat/company')
export class CompanyController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param companyService 注入的企业服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly companyService: CompanyService,
  ) {
    const main = {
      pid: 610,
      moduleName: '微信',
      objectName: '企业',
      type: '接口',
    };
    // 企业管理
    [
      { id: 612, name: '企业列表', description: '企业列表' },
      { id: 613, name: '企业详情', description: '企业详情' },
      { id: 614, name: '企业变更历史', description: '企业变更历史' },
      { id: 615, name: '创建企业', description: '创建企业' },
      { id: 616, name: '修改企业', description: '修改企业' },
      { id: 617, name: '企业排序', description: '企业排序' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取企业清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(612)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.companyService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取企业详情
   * @param corpid 企业微信ID
   * @param res 响应上下文
   */
  @Get(':corpid/show')
  @Abilities(613)
  async show(
    @Param('corpid') corpid: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.companyService.show(corpid);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取企业变更日志
   * @param corpid 企业微信ID
   * @param res 响应上下文
   */
  @Get(':corpid/log')
  @Abilities(614)
  async log(
    @Param('corpid') corpid: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.companyService.log(corpid);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建企业
   * @param value 提交的企业信息
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(615)
  async create(@Body() value: CompanyDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.companyService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新企业（含禁用和启用企业）
   * @param hostId 企业ID
   * @param value 提交的企业信息
   * @param res 响应上下文
   */
  @Post(':corpid/update')
  @Abilities(616)
  async update(
    @Param('corpid') corpid: string,
    @Body() value: CompanyDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.companyService.update(
      corpid,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 企业排序
   * @param value 提交的排序信息
   * @param res 响应上下文
   */
  @Post('sort')
  @Abilities(617)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.companyService.sort(value);
    res.status(200).json(res.locals.result);
  }
}
