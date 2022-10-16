// 外部依赖
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class LogService {
  @OnEvent('addLog')
  async addLog(data: any) {
    console.debug('data', data);
  }
}
