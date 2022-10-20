// 外部依赖
import { networkInterfaces, NetworkInterfaceInfo } from 'os';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
// 内部依赖
import { Result, ReqService } from '../../shared';
import { Auth, TokenService } from '..';

/**全局用路由守卫，完成token令牌认证和权限点认证 */
@Injectable()
export class TokenGuard implements CanActivate {
  /**
   * 构造函数
   * @param reflector 反射器
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly reqService: ReqService,
    private readonly token: TokenService,
  ) {}

  /**
   * 路由守卫函数
   * @param context 执行上下文
   * @returns 守卫通过标记
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**请求收到时间 */
    const startAt = Date.now();
    /**请求上下文 */
    const req: Request = context.switchToHttp().getRequest();
    /**响应上下文 */
    const res: Response = context.switchToHttp().getResponse();
    /**请求客户端IP */
    const clientIp = req.headers['x-real-ip'] || req.ip;
    /**本地网卡信息 */
    const network = networkInterfaces();
    /**响应服务端IP */
    const serverIp = network?.eth0
      ? network.eth0.filter(
          (item: NetworkInterfaceInfo) => item.family === 'IPv4',
        )[0].address
      : '127.0.0.1';
    // 请求消息可能存在敏感信息，为在控制器中脱敏，然后在拦截器之后保存到日志中
    res.locals.request = {
      headers: {
        host: req.headers.host,
        token: req.headers.token || '',
      },
      url: req.url,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body,
    };
    let status = 200;
    /**路径路由 */
    const route: string[] = req.url.split('/');
    /**模块名 */
    const module = route.length ? (route[0] ? route[0] : route[1]) : '/';
    /**调用的控制器的类名 */
    const controller = context.getClass().name;
    /**调用的控制器的方法名 */
    const action = context.getHandler().name;
    /**组装请求日志参数 */
    const params = {
      startAt,
      clientIp,
      serverIp,
      status,
      module,
      controller,
      action,
      userId: 0,
    };
    // 如果请求url是passport开头，或notify开头，或包含startup则路由验证通过
    if (['passport', 'notify'].includes(module) || route.includes('startup')) {
      res.locals.reqId = await this.reqService.insert(params);
      return true;
    }
    /**当前路由需要权限点 */
    const abilities =
      this.reflector.get<number[]>('abilities', context.getHandler()) || [];
    /**消息头中的令牌 */
    const token = req.headers.token as string;
    /**令牌验证结果 */
    const auth: Auth = await this.token.verify(token, abilities);
    // 令牌验证不通过
    if (auth.invalid) {
      let result: Result;
      if (auth.userId) {
        result = { code: 403, msg: '用户未授权使用该接口' };
      } else {
        status = 401;
        result = { code: 401, msg: '令牌验证失败' };
      }
      this.reqService.insert({
        ...params,
        status,
        request: res.locals.request,
        userId: auth.userId,
      });
      // 抛出异常。注：路由守卫抛出异常后，将不会再调用拦截器
      throw new HttpException(result, status);
    }
    res.locals.userId = auth.userId;
    res.locals.reqId = await this.reqService.insert({
      ...params,
      userId: res.locals.userId,
    });
    return true;
  }
}
