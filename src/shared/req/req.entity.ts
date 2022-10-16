import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**请求日志表 */
@Entity('req_logs')
export class ReqEntity {
  /**请求ID */
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'reqid', comment: '请求ID' })
  reqId: number;

  /**请求用户ID */
  @Column({ type: 'bigint', name: 'userid', default: 0, comment: '用户ID' })
  userID: number;

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
  @Column({ type: 'json', name: 'result', comment: '响应结果' })
  result: object;

  /**客户端IP */
  @Column({ type: 'text', name: 'clientip', comment: '客户端IP' })
  clientIp: string;

  /**服务器IP */
  @Column({ type: 'text', name: 'serverip', comment: '服务器IP' })
  serverIp: string;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'start_at', comment: '请求到达时间' })
  startAt: number;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'end_at', comment: '响应完成时间' })
  endAt: number;
}
