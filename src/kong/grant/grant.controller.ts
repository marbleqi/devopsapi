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
import { GrantDto, GrantService } from '..';

@Controller('kong/grant')
export class GrantController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param grantService 注入的授权服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly grantService: GrantService,
  ) {
    // 授权管理
    this.abilityService.add([
      { id: 522, pid: 520, name: '授权列表', description: '授权列表' },
      { id: 523, pid: 520, name: '授权详情', description: '授权详情' },
      { id: 524, pid: 520, name: '授权变更历史', description: '授权变更历史' },
      { id: 525, pid: 520, name: '创建授权', description: '创建授权' },
      { id: 526, pid: 520, name: '修改授权', description: '修改授权' },
    ] as Ability[]);
  }

  /**
   * 获取授权清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(522)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.grantService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取授权详情
   * @param userId 用户ID
   * @param res 响应上下文
   */
  @Get(':userId/show')
  @Abilities(523)
  async show(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.grantService.show(userId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取授权变更日志
   * @param userId 用户ID
   * @param res 响应上下文
   */
  @Get(':userId/log')
  @Abilities(524)
  async log(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.grantService.log(userId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建授权
   * @param value 提交的授权信息
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(525)
  async create(@Body() value: GrantDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.grantService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新授权（含禁用和启用授权）
   * @param userId 用户ID
   * @param value 提交的授权信息
   * @param res 响应上下文
   */
  @Post(':userId/update')
  @Abilities(526)
  async update(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Body() value: GrantDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.grantService.update(
      userId,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
