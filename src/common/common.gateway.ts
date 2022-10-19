// 外部依赖
import {
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
// 内部依赖
import { QueueService } from '../shared';

/**通用长连接 */
@WebSocketGateway({ namespace: 'common', cors: { origin: true } })
export class CommonGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /**Socket服务端 */
  @WebSocketServer() server: Server;

  /**
   * 构造函数
   * @param queue 注入的队列服务
   */
  constructor(private readonly queue: QueueService) {}

  /**
   * WebSocket初始化处理
   * @param server 服务端对象
   */
  async afterInit(server: any) {
    console.debug('WebSocket监听启动', server.name);
    // 有前端订阅消息时，向前端发送全局消息
    this.queue.webSub.subscribe((res: { name: string; data?: any }) => {
      console.debug('收到订阅要发布到前端的消息', res.name, res?.data);
      if (res?.data) {
        this.server.emit(res.name, res.data);
      } else {
        this.server.emit(res.name);
      }
    });
  }

  /**
   * WebSocket有连接接入时处理
   * @param client 客户端对象
   * @param args 请求参数
   */
  async handleConnection(client: any, ...args: any[]) {
    console.debug('有连接主动接入', client.id, args);
  }

  /**
   * WebSocket有连接断开时处理
   * @param client 客户端对象
   */
  async handleDisconnect(client: any) {
    // console.debug(client.id);
    // await this.redis.del('ws:' + client.id);
    console.debug('会话断开', client.id);
  }

  /**
   * 收到前端发送消息
   * @param client 客户端对象
   * @param payload 客户端发送数据
   */
  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any) {
    console.debug('client', client);
    console.debug('payload', payload);
  }
}
