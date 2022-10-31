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
import { KongHostDto, HostService } from '..';

@Controller('kong/host')
export class HostController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param hostService 注入的站点服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly hostService: HostService,
  ) {
    // 站点管理
    this.abilityService.add([
      { id: 512, pid: 510, name: '站点列表', description: '站点列表' },
      { id: 513, pid: 510, name: '站点详情', description: '站点详情' },
      { id: 514, pid: 510, name: '站点变更历史', description: '创建站点' },
      { id: 515, pid: 510, name: '创建站点', description: '创建站点' },
      { id: 516, pid: 510, name: '修改站点', description: '修改站点' },
      { id: 517, pid: 510, name: '站点排序', description: '站点排序' },
    ] as Ability[]);
  }

  /**
   * 获取站点清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(512)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.hostService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取站点详情
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Get(':hostId/show')
  @Abilities(513)
  async show(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.hostService.show(hostId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取站点变更日志
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Get(':hostId/log')
  @Abilities(514)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.hostService.log(hostId);
    res.status(200).json(res.locals.result);
  }
  /**
   * 创建角色
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(515)
  async create(
    @Body() value: KongHostDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.hostService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新角色（含禁用和启用角色）
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/update')
  @Abilities(516)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: KongHostDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.hostService.update(
      hostId,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 角色排序
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('sort')
  @Abilities(517)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.hostService.sort(value);
    res.status(200).json(res.locals.result);
  }
}
