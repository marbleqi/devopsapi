// 外部依赖
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';
// 内部依赖
import { ReqService } from '..';

/**全局拦截器，给响应消息加上请求标记，并发出响应，发送记录日志任务 */
@Injectable()
export class ReqInterceptor implements NestInterceptor {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   */
  constructor(private readonly reqService: ReqService) {}

  /**
   * 拦截器函数
   * @param context 处理上下文
   * @param next 函数处理后
   * @returns 响应消息可观察者
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const res: Response = context.switchToHttp().getResponse();
        this.reqService.update(res.locals.reqId, res.locals.result);
      }),
    );
  }
}
