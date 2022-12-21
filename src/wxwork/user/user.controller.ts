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
import { CreateWxworkUserDto, UpdateWxworkUserDto, UserService } from '..';

@Controller('wxwork/user')
export class UserController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param userService 注入的用户服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly userService: UserService,
  ) {
    const main = {
      pid: 330,
      moduleName: '企业微信',
      objectName: '用户',
      type: '接口',
    };
    // 用户管理
    [
      { id: 331, name: '部门列表', description: '部门列表' },
      { id: 332, name: '用户列表', description: '用户列表' },
      { id: 335, name: '创建用户', description: '创建新的用户' },
      { id: 336, name: '更新用户', description: '更新用户' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  @Get('depart')
  @Abilities(332)
  async depart(@Res() res: Response) {
    console.debug('触发事件');
    res.locals.result = await this.userService.depart();
    res.status(200).json(res.locals.result);
  }

  @Get('index/:id')
  @Abilities(332)
  async apiindex(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.userService.apiIndex(id);
    res.status(200).json(res.locals.result);
  }

  @Get('index')
  @Abilities(332)
  async dbindex(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.userService.dbIndex(operateId);
    res.status(200).json(res.locals.result);
  }

  @Post('create')
  @Abilities(335)
  async create(@Body() value: CreateWxworkUserDto, @Res() res: Response) {
    res.locals.result = await this.userService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  @Post('save')
  @Abilities(336)
  async save(@Body() value: UpdateWxworkUserDto, @Res() res: Response) {
    res.locals.result = await this.userService.save(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
