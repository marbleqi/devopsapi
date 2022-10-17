// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { QueueService } from '../../shared';
import { Ability, Abilities, AbilityService, MenuService } from '..';

@Controller('auth/menu')
export class MenuController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param menu 注入的菜单服务
   * @param queue 注入的队列服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly menu: MenuService,
    private readonly queue: QueueService,
  ) {
    // 菜单管理
    this.ability.add([
      {
        id: 131,
        pid: 130,
        name: '菜单选项',
        description: '获取菜单选项，仅返回菜单ID，菜单上级ID和菜单名称两项',
      },
      {
        id: 132,
        pid: 130,
        name: '菜单列表',
        description: '查看菜单列表，返回较多字段，用于列表查看',
      },
      { id: 133, pid: 130, name: '菜单详情', description: '查看菜单详情' },
      { id: 134, pid: 130, name: '创建菜单', description: '创建新的菜单' },
      { id: 135, pid: 130, name: '修改菜单', description: '修改已有的菜单' },
      {
        id: 136,
        pid: 130,
        name: '菜单排序',
        description: '对已有菜单进行排序',
      },
    ] as Ability[]);
  }

  /**
   * 获取菜单清单
   * @param operateid 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(8, 9, 131, 132)
  async index(
    @Query('operateid', new ParseIntPipe()) operateid: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.index(operateid);
  }

  /**
   * 获取菜单详情
   * @param id 菜单ID
   * @param res 响应上下文
   */
  @Get(':id/show')
  @Abilities(8, 9, 133)
  async show(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.show(id);
  }

  /**
   * 获取菜单变更日志
   * @param id 菜单ID
   * @param res 响应上下文
   */
  @Get(':id/log')
  @Abilities(8, 9, 133)
  async log(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.log(id);
  }

  /**
   * 创建菜单
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(9, 134)
  async create(@Body() value: object, @Res() res: Response): Promise<void> {
    res.locals.result = await this.menu.create(res.locals.userid, value);
    if (!res.locals.result.code) {
      await this.queue.add('menu', {
        operate: 'create',
        reqid: res.locals.reqid,
        operateid: res.locals.result.operateid,
      });
    }
  }

  /**
   * 更新菜单（含禁用和启用菜单）
   * @param id 菜单ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':id/update')
  @Abilities(9, 135)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() value: object,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.update(res.locals.userid, id, value);
    if (!res.locals.result.code) {
      await this.queue.add('menu', {
        operate: 'update',
        reqid: res.locals.reqid,
        operateid: res.locals.result.operateid,
      });
    }
  }

  /**
   * 菜单排序
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('sort')
  @Abilities(9, 136)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.menu.sort(value);
    if (!res.locals.result.code) {
      await this.queue.add('sort', { object: 'menu', reqid: res.locals.reqid });
    }
  }
}
