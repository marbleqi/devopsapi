// 外部依赖
import { Controller, Res, Param, Get, Post, Delete } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService, TokenService } from '..';

@Controller('auth/token')
export class TokenController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param token 注入的令牌服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly token: TokenService,
  ) {
    // 令牌管理
    this.ability.add([
      { id: 162, pid: 160, name: '令牌列表', description: '查看令牌列表' },
      { id: 164, pid: 160, name: '缓存令牌', description: '重新缓存令牌' },
      { id: 167, pid: 160, name: '作废令牌', description: '作废单个令牌' },
    ] as Ability[]);
  }

  /**
   * 获取令牌清单
   * @param res 响应上下文
   */
  @Get()
  @Abilities(8, 9, 162)
  async index(@Res() res: Response): Promise<void> {
    res.locals.result = await this.token.index();
  }

  /**
   * 重新下发令牌权限配置
   * @param res 响应上下文
   */
  @Post()
  @Abilities(9, 164)
  async init(@Res() res: Response): Promise<void> {
    res.locals.result = await this.token.init();
  }

  /**
   * 令牌作废
   * @param token 待作废的令牌
   * @param res 响应上下文
   */
  @Delete(':token')
  @Abilities(9, 167)
  async destroy(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.token.destroy(token);
  }
}
