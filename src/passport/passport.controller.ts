// 外部依赖
import {
  Controller,
  Get,
  Post,
  Headers,
  Param,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { PassportService } from '.';

/**认证控制器，用户身份认证，提交消息头无token */
@Controller('passport')
export class PassportController {
  /**
   * 构造函数
   * @param passport 注入的passport服务
   */
  constructor(private readonly passport: PassportService) {}

  /**
   * 获取初始化参数
   * @param res 响应上下文
   */
  @Get('startup')
  async startup(@Res() res: Response): Promise<void> {
    res.locals.result = await this.passport.startup();
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取扫码相关信息
   * @param type 二维码类型
   * @param res 响应上下文
   */
  @Get('qrurl/:type')
  async qrurl(
    @Param('type') type: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.passport.qrurl(type);
    res.status(200).json(res.locals.result);
  }

  /**
   * 用户名密码登陆验证
   * @param loginName 登陆名
   * @param loginPsw 登陆密码
   * @param loginIp 登陆IP
   * @param res 响应上下文
   */
  @Post('login')
  async login(
    @Body('loginName') loginName: string,
    @Body('loginPsw') loginPsw: string,
    @Headers('x-real-ip') loginIp: string,
    @Res() res: Response,
  ): Promise<void> {
    // 将上下文的密码替换，避免将密码明文记入日志
    res.locals.request.body.loginPsw = '************';
    res.locals.result = await this.passport.login(loginName, loginPsw, loginIp);
    res.status(200).json(res.locals.result);
  }

  /**
   * 扫码回调
   * @param value 扫码获得的code
   * @param res 响应上下文
   */
  @Post('callback/:type')
  async callback(
    @Param('type') type: string,
    @Headers('x-real-ip') loginIp: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.passport.callback(type, value, loginIp);
    res.status(200).json(res.locals.result);
  }
}
