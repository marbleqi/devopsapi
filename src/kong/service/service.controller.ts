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
import { ServiceDto, HostService } from '..';

@Controller('service')
export class ServiceController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param hostService 注入的服务服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly hostService: HostService,
  ) {
    // 服务管理
    this.abilityService.add([
      { id: 511, pid: 530, name: '服务同步', description: '服务同步' },
      { id: 512, pid: 530, name: '服务列表', description: '服务列表' },
      { id: 513, pid: 530, name: '服务详情', description: '服务详情' },
      { id: 514, pid: 530, name: '服务变更历史', description: '创建服务' },
      { id: 515, pid: 530, name: '创建服务', description: '创建服务' },
      { id: 516, pid: 530, name: '修改服务', description: '修改服务' },
    ] as Ability[]);
  }

  /**
   * 获取服务清单
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
   * 获取服务详情
   * @param hostId 服务ID
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
   * 获取服务变更日志
   * @param hostId 服务ID
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
    @Body() value: ServiceDto,
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
   * @param hostId 服务ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/update')
  @Abilities(516)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: ServiceDto,
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
