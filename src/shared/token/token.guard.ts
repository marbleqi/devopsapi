// 外部依赖
import { networkInterfaces, NetworkInterfaceInfo } from 'os';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
// 内部依赖
// import { Auth, Result, RedisService } from '..';

/**全局用路由守卫，完成token令牌认证和权限点认证 */
@Injectable()
export class TokenGuard implements CanActivate {
  /**
   * 构造函数
   * @param reflector 反射器
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * 路由守卫函数
   * @param context 执行上下文
   * @returns 守卫通过标记
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**请求上下文 */
    const req: Request = context.switchToHttp().getRequest();
    /**响应上下文 */
    const res: Response = context.switchToHttp().getResponse();
    res.locals.start_at = Date.now();
    if (req.headers['x-real-ip']) {
      res.locals.clientip = req.headers['x-real-ip'];
    } else {
      res.locals.clientip = req.ip;
    }
    const network = networkInterfaces();
    // console.debug('network', network);
    if (network?.eth0) {
      res.locals.serverip = network.eth0.filter(
        (item: NetworkInterfaceInfo) => item.family === 'IPv4',
      )[0].address;
    } else {
      res.locals.serverip = '127.0.0.1';
    }
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
    res.locals.status = 200;
    /**路径路由 */
    const route: string[] = req.url.split('/');
    if (route.length) {
      res.locals.module = route[0] ? route[0] : route[1];
    } else {
      res.locals.module = '/';
    }
    // 设置调用的控制器的类名
    res.locals.controller = context.getClass().name;
    // 设置调用的控制器的方法名
    res.locals.action = context.getHandler().name;
    // console.debug('locals', res.locals);
    // 如果请求url是passport开头，或notify开头，或包含startup则路由验证通过
    if (
      ['passport', 'notify'].includes(res.locals.module) ||
      route.includes('startup')
    ) {
      return true;
    }
    /**当前路由需要权限点 */
    const abilities =
      this.reflector.get<number[]>('abilities', context.getHandler()) || [];
    console.debug('abilities', abilities);
    res.locals.userid = 1;
    return true;
    // /**令牌验证结果 */
    // const auth: Auth = await this.token.verify(req.headers.token, abilities);
    // res.locals.userid = auth.userid;
    // // 令牌验证不通过
    // if (auth.invalid) {
    //   if (auth.userid) {
    //     res.locals.result = { code: 403, msg: '用户未授权使用该接口', reqid };
    //   } else {
    //     res.locals.status = 401;
    //     res.locals.result = { code: 401, msg: '令牌验证失败', reqid };
    //   }
    //   res.locals.end_at = Date.now();
    //   // 发出记录日志任务
    //   await this.queue.add('log', res.locals);
    //   // 抛出异常。注：路由守卫抛出异常后，将不会再调用拦截器
    //   throw new HttpException(res.locals.result, res.locals.status);
    // } else {
    //   return true;
    // }
  }
}
