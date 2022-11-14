// 外部依赖
import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { UserService } from '../../auth';

/**用户个人管理控制器，登陆用户皆有自我管理权限，所以不用验证权限点 */
@Controller('common/user')
export class UserController {
  /**
   * 获取个人信息
   * @param userService 注入的用户服务
   */
  constructor(private readonly userService: UserService) {}

  /**
   * 获取个人信息
   * @param res 响应上下文
   */
  @Get('show')
  async show(@Res() res: Response) {
    res.locals.result = await this.userService.show(res.locals.userId);
    res.status(200).json(res.locals.result);
  }
  /**
   * 修改密码
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('secure')
  async secure(@Body() value: object, @Res() res: Response) {
    res.locals.result = await this.userService.secure(res.locals.userId, value);
    res.status(200).json(res.locals.result);
  }
}
