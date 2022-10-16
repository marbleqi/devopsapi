// 外部依赖
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ReqService {
  @OnEvent('addLog')
  handleOrderCreatedEvent(payload: any) {
    console.debug('事件监听器A得到消息', payload);
  }
}
