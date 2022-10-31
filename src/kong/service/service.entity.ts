import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
} from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**KONG服务基类 */
export abstract class KongServiceBaseEntity extends CommonBaseEntity {
  /**创建时间 */
  @Column({ type: 'bigint', name: 'created_at', comment: '创建时间' })
  created_at: number;

  /**更新时间 */
  @Column({ type: 'bigint', name: 'updated_at', comment: '更新时间' })
  updated_at: number;

  /**服务名 */
  @Column({ type: 'text', name: 'name', comment: '服务名' })
  name: string;

  /**重试次数 */
  @Column({ type: 'bigint', name: 'retries', comment: '重试次数' })
  retries: number;

  /**协议 */
  @Column({ type: 'text', name: 'protocol', comment: '协议' })
  protocol: string;

  /**主机 */
  @Column({ type: 'text', name: 'host', comment: '主机' })
  host: string;

  /**端口号 */
  @Column({ type: 'bigint', name: 'port', default: 80, comment: '端口号' })
  port: number;

  /**路径 */
  @Column({ type: 'text', name: 'path', comment: '路径' })
  path: string;

  /**连接超时时间 */
  @Column({
    type: 'bigint',
    name: 'connect_timeout',
    default: 60000,
    comment: '连接超时时间',
  })
  connect_timeout: number;

  /**写超时时间 */
  @Column({
    type: 'bigint',
    name: 'write_timeout',
    default: 60000,
    comment: '写超时时间',
  })
  write_timeout: number;

  /**读超时时间 */
  @Column({
    type: 'bigint',
    name: 'read_timeout',
    default: 60000,
    comment: '读超时时间',
  })
  read_timeout: number;

  /**标签 */
  @Column({ type: 'text', name: 'tags', comment: '标签' })
  tags: string[];

  /**路径 */
  @Column({
    type: 'uuid',
    name: 'client_certificate_id',
    comment: '客户端证书',
  })
  client_certificate: { id: string };

  /**开启上游TLS证书验证 */
  @Column({ type: 'bool', name: 'tls_verify', comment: '开启上游TLS证书验证' })
  tls_verify: boolean;

  /**TLS证书最大链深度 */
  @Column({ type: 'int', name: 'tls_verify', comment: 'TLS证书最大链深度' })
  tls_verify_depth: number;

  /**CA证书 */
  @Column({ type: 'uuid', name: 'ca_certificates', comment: 'CA证书' })
  ca_certificates: string[];

  /**可用 */
  @Column({ type: 'bool', name: 'enabled', comment: '可用' })
  enabled: boolean;
}

/**KONG服务表 */
@Entity('kong_services')
export class KongServiceEntity extends KongServiceBaseEntity {
  /**服务ID */
  @PrimaryColumn({ type: 'uuid', name: 'id', comment: '服务ID' })
  id: string;

  /**创建用户ID */
  @Column({
    type: 'bigint',
    name: 'create_user_id',
    default: 1,
    comment: '创建用户ID',
  })
  createUserId: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.createUserId = Number(this.createUserId);
  }
}

/**KONG服务日志表 */
@Entity('kong_services_logs')
export class KongServiceLogEntity extends KongServiceBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**服务ID */
  @Column({ type: 'uuid', name: 'id', comment: '服务ID' })
  id: string;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
  }
}
