// 外部依赖
// 外部依赖
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { ReqService } from '../../shared';
import { Ability, Abilities, AbilityService } from '../../auth';
import { ReqDto } from '..';

@Controller('sys/req')
export class ReqController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param reqService 注入的请求日志服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly reqService: ReqService,
  ) {
    // 日志管理
    this.abilityService.add([
      {
        id: 222,
        pid: 220,
        name: '日志列表',
        description: '查看日志列表，返回较多字段，用于列表查看',
      },
      {
        id: 223,
        pid: 220,
        name: '日志详情',
        description: '查看日志详情，编辑页面初始化时数据',
      },
    ] as Ability[]);
  }

  /**
   * 获取模块清单
   * @param res 响应上下文
   */
  @Get('module')
  @Abilities(222)
  async module(@Res() res: Response): Promise<void> {
    res.locals.result = await this.reqService.module();
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取控制器清单
   * @param module 模块名
   * @param res 响应上下文
   */
  @Get('controller')
  @Abilities(222)
  async controller(
    @Query('module') module: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.reqService.controller(module);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取操作清单
   * @param module 模块名
   * @param controller 控制器名
   * @param res 响应上下文
   */
  @Get('action')
  @Abilities(222)
  async action(
    @Query('module') module: string,
    @Query('controller') controller: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.reqService.action(module, controller);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取日志清单
   * @param value 条件参数
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(222)
  async index(@Query() value: ReqDto, @Res() res: Response): Promise<void> {
    console.debug('value', value);
    res.locals.result = await this.reqService.index(value, res.locals.reqId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取日志详情
   * @param reqId 请求日志ID
   * @param res 响应上下文
   */
  @Get(':reqId/show')
  @Abilities(223)
  async show(
    @Param('reqId', new ParseIntPipe()) reqId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.reqService.show(reqId);
    res.status(200).json(res.locals.result);
  }
}
