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
import { CreateDingtalkUserDto, UpdateDingtalkUserDto, UserService } from '..';

@Controller('dingtalk/user')
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
      pid: 430,
      moduleName: '钉钉',
      objectName: '用户',
      type: '接口',
    };
    // 用户管理
    [
      { id: 432, name: '钉钉用户列表', description: '钉钉用户列表' },
      { id: 435, name: '创建关联用户', description: '创建关联用户' },
      { id: 436, name: '更新关联用户', description: '更新关联用户' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  @Get('depart/:dept_id')
  @Abilities(432)
  async depart(
    @Param('dept_id', new ParseIntPipe()) dept_id: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.userService.depart(dept_id);
    res.status(200).json(res.locals.result);
  }

  @Get('index/:dept_id')
  @Abilities(432)
  async apiIndex(
    @Param('dept_id', new ParseIntPipe()) dept_id: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.userService.apiIndex(dept_id);
    res.status(200).json(res.locals.result);
  }

  @Get('index')
  @Abilities(432)
  async dbIndex(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.userService.dbIndex(operateId);
    res.status(200).json(res.locals.result);
  }

  @Post('create')
  @Abilities(435)
  async create(@Body() value: CreateDingtalkUserDto, @Res() res: Response) {
    res.locals.result = await this.userService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  @Post('save')
  @Abilities(436)
  async save(@Body() value: UpdateDingtalkUserDto, @Res() res: Response) {
    res.locals.result = await this.userService.save(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
