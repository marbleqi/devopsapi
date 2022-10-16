// 外部依赖
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';
// 内部依赖

/**全局拦截器，给响应消息加上请求标记，并发出响应，发送记录日志任务 */
@Injectable()
export class ReqInterceptor implements NestInterceptor {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   */
  constructor(private eventEmitter: EventEmitter2) {}

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
        res.locals.end_at = Date.now();
        console.debug('拦截器收到消息', res.locals);
        this.eventEmitter.emit('addLog', res.locals);
      }),
    );
  }
}
