import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';

/**请求日志表 */
@Entity('req_logs')
export class ReqEntity {
  /**请求ID */
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'req_id', comment: '请求ID' })
  reqId: number;

  /**请求用户ID */
  @Column({
    type: 'bigint',
    name: 'user_id',
    default: 0,
    comment: '请求用户ID',
  })
  userId: number;

  /**模块名 */
  @Column({ type: 'text', name: 'module', comment: '模块名' })
  module: string;

  /**控制器名 */
  @Column({ type: 'text', name: 'controller', comment: '控制器名' })
  controller: string;

  /**方法名 */
  @Column({ type: 'text', name: 'action', comment: '方法名' })
  action: string;

  /**请求信息 */
  @Column({ type: 'json', name: 'request', comment: '请求信息' })
  request: object;

  /**状态码 */
  @Column({ type: 'int', name: 'status', comment: '状态码' })
  status: number;

  /**响应结果 */
  @Column({ type: 'json', name: 'result', nullable: true, comment: '响应结果' })
  result: object;

  /**客户端IP */
  @Column({ type: 'text', name: 'client_ip', comment: '客户端IP' })
  clientIp: string;

  /**服务器IP */
  @Column({ type: 'text', name: 'server_ip', comment: '服务器IP' })
  serverIp: string;

  /**请求到达时间 */
  @Column({ type: 'bigint', name: 'start_at', comment: '请求到达时间' })
  startAt: number;

  /**响应完成时间 */
  @Column({
    type: 'bigint',
    name: 'end_at',
    nullable: true,
    comment: '响应完成时间',
  })
  endAt: number;

  /**长整型数据返回时，进行数据转换 */
  @AfterLoad()
  reqLoad() {
    this.reqId = Number(this.reqId);
    this.userId = Number(this.userId);
    this.status = Number(this.status);
    this.startAt = Number(this.startAt);
    this.endAt = Number(this.endAt);
  }
}
