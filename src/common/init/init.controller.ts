// 外部依赖
import {
  Controller,
  Get,
  Headers,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Auth, TokenService } from '../../auth';
import { InitService } from '..';

/**初始化控制器 */
@Controller('common/init')
export class InitController {
  /**
   * 构造函数
   * @param tokenService 注入的令牌服务
   * @param initService 注入的初始化服务
   */
  constructor(
    private readonly tokenService: TokenService,
    private readonly initService: InitService,
  ) {}

  /**
   * 前端启动初始化时调用的应用初始化接口
   * @param token 令牌
   * @param res 响应上下文
   */
  @Get('startup')
  async startup(
    @Headers('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    /**令牌验证结果 */
    const auth: Auth = await this.tokenService.verify(token);
    res.locals.userId = auth.userId;
    res.locals.result = await this.initService.startup(auth);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取配置清单
   * @param res 响应上下文
   */
  @Get('sys')
  sys(@Res() res: Response): void {
    res.locals.result = this.initService.sys();
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取角色清单（角色ID，角色名称，操作序号）
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('role')
  async role(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.initService.role(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取用户清单（用户ID，用户姓名，操作序号）
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('user')
  async user(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.initService.user(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取菜单清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('menu')
  async menu(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.initService.menu(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新令牌
   * @param token 原令牌名
   * @param res 响应上下文
   */
  @Get('refresh')
  async refresh(
    @Headers('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.initService.refresh(token);
    res.status(200).json(res.locals.result);
  }
}
