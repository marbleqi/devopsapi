// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import {
  Ability,
  Abilities,
  AbilityService,
  MenuService,
  RoleService,
} from '..';

@Controller('auth/ability')
export class AbilityController {
  /**
   * 构造函数
   * @param ability 注入的共享权限点服务
   * @param queue 注入的队列服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly menuService: MenuService,
    private readonly roleService: RoleService,
  ) {
    // 权限点管理
    this.ability.add([
      {
        id: 122,
        pid: 120,
        name: '权限点列表',
        description: '查看权限点列表，返回较多字段，用于列表查看',
      },
    ] as Ability[]);
  }

  /**
   * 获取权限点清单
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(8, 9, 122)
  index(@Res() res: Response): void {
    res.locals.result = { code: 0, msg: 'ok', data: this.ability.get() };
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取授权权限点的菜单
   * @param id 权限点ID
   * @param res 响应上下文
   */
  @Get(':id/menu')
  @Abilities(8, 9, 133)
  async menu(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menuService.granted(id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取授权权限点的角色
   * @param id 权限点ID
   * @param res 响应上下文
   */
  @Get(':id/role')
  @Abilities(8, 9, 143)
  async role(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.roleService.granted(id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置授权权限点的菜单
   * @param id 权限点ID
   * @param menuIds 菜单ID数组
   * @param res 响应上下文
   */
  @Post(':id/menu')
  @Abilities(8, 9, 135)
  async setmenu(
    @Param('id', new ParseIntPipe()) id: number,
    @Body('objectlist') menuIds: number[],
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.menuService.grant(
      id,
      menuIds,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置授权权限点的角色
   * @param id 权限点ID
   * @param roleIds 角色ID数组
   * @param res 响应上下文
   */
  @Post(':id/role')
  @Abilities(8, 9, 145)
  async setrole(
    @Param('id', new ParseIntPipe()) id: number,
    @Body('objectlist') roleIds: number[],
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.roleService.grant(
      id,
      roleIds,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
