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
import { Ability, Abilities, MenuDto, AbilityService, MenuService } from '..';

/**菜单控制器 */
@Controller('auth/menu')
export class MenuController {
  /**
   * 构造函数
   * @param abilityService 权限点服务
   * @param menuService 菜单服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly menuService: MenuService,
  ) {
    const type = '接口';
    const moduleName = '认证';
    const objectName = '菜单';
    // 菜单管理
    this.abilityService.add(
      [
        { id: 122, pid: 120, name: '菜单列表', description: '查看菜单列表' },
        { id: 123, pid: 120, name: '菜单详情', description: '查看菜单详情' },
        {
          id: 124,
          pid: 120,
          name: '菜单更新历史',
          description: '菜单更新历史',
        },
        { id: 125, pid: 120, name: '创建菜单', description: '创建新的菜单' },
        { id: 126, pid: 120, name: '修改菜单', description: '修改已有的菜单' },
        { id: 127, pid: 120, name: '菜单排序', description: '对菜单进行排序' },
      ].map((item) => ({ ...item, type, moduleName, objectName })) as Ability[],
    );
  }

  /**
   * 获取菜单清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(122)
  async index(
    @Query('operateId') operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menuService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取菜单详情
   * @param menuId 菜单ID
   * @param res 响应上下文
   */
  @Get(':menuId/show')
  @Abilities(123)
  async show(
    @Param('menuId', new ParseIntPipe()) menuId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menuService.show(menuId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取菜单变更日志
   * @param menuId 菜单ID
   * @param res 响应上下文
   */
  @Get(':menuId/log')
  @Abilities(124)
  async log(
    @Param('menuId', new ParseIntPipe()) menuId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menuService.log(menuId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建菜单
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(125)
  async create(@Body() value: MenuDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.menuService.create(
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
  @Abilities(126)
  async update(
    @Param('menuId', new ParseIntPipe()) menuId: number,
    @Body() value: MenuDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menuService.update(
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
  @Abilities(127)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.menuService.sort(value);
    res.status(200).json(res.locals.result);
  }
}
