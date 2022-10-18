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
import { Ability, Abilities, AbilityService, MenuService } from '..';

@Controller('auth/menu')
export class MenuController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param menu 注入的菜单服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly menu: MenuService,
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
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(8, 9, 131, 132)
  async index(
    @Query('operateId') operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    console.debug('operateId', operateId);
    res.locals.result = await this.menu.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取菜单详情
   * @param menuId 菜单ID
   * @param res 响应上下文
   */
  @Get(':menuId/show')
  @Abilities(8, 9, 133)
  async show(
    @Param('menuId', new ParseIntPipe()) menuId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.show(menuId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取菜单变更日志
   * @param menuId 菜单ID
   * @param res 响应上下文
   */
  @Get(':menuId/log')
  @Abilities(8, 9, 133)
  async log(
    @Param('menuId', new ParseIntPipe()) menuId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.log(menuId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建菜单
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(9, 134)
  async create(@Body() value: object, @Res() res: Response): Promise<void> {
    res.locals.result = await this.menu.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新菜单（含禁用和启用菜单）
   * @param menuId 菜单ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':menuId/update')
  @Abilities(9, 135)
  async update(
    @Param('menuId', new ParseIntPipe()) menuId: number,
    @Body() value: object,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menu.update(
      menuId,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
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
    res.status(200).json(res.locals.result);
  }
}
