import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
} from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**KONG路由基类 */
export abstract class KongCertificateBaseEntity extends CommonBaseEntity {
  /**创建时间 */
  @Column({ type: 'bigint', name: 'created_at', comment: '创建时间' })
  created_at: number;

  /**更新时间 */
  @Column({ type: 'bigint', name: 'updated_at', comment: '更新时间' })
  updated_at: number;

  /**服务名 */
  @Column({ type: 'text', name: 'name', comment: '服务名' })
  name: string;

  /**协议 */
  @Column({ type: 'text', name: 'protocols', comment: '协议' })
  protocols: string[];

  /**方法 */
  @Column({ type: 'text', name: 'methods', comment: '方法' })
  methods: string[];

  /**域名 */
  @Column({ type: 'text', name: 'hosts', comment: '域名' })
  hosts: string[];

  /**路径 */
  @Column({ type: 'text', name: 'paths', comment: '路径' })
  paths: string[];

  /**请求头 */
  @Column({ type: 'jsonb', name: 'headers', comment: '请求头' })
  headers: any;

  /**重定向状态码 */
  @Column({
    type: 'int',
    name: 'https_redirect_status_code',
    default: 426,
    comment: '连接超时时间',
  })
  https_redirect_status_code: number;

  /**写超时时间 */
  @Column({
    type: 'bigint',
    name: 'regex_priority',
    default: 60000,
    comment: '写超时时间',
  })
  regex_priority: number;

  /**开启上游TLS证书验证 */
  @Column({ type: 'bool', name: 'strip_path', comment: '开启上游TLS证书验证' })
  strip_path: boolean;

  /**路径组合方式 */
  @Column({ type: 'text', name: 'path_handling', comment: '路径组合方式' })
  path_handling: string;

  /**启用服务域名 */
  @Column({ type: 'bool', name: 'preserve_host', comment: '启用服务域名' })
  preserve_host: boolean;

  /**开启请求缓冲 */
  @Column({ type: 'bool', name: 'request_buffering', comment: '开启请求缓冲' })
  request_buffering: boolean;

  /**开启响应缓冲 */
  @Column({ type: 'bool', name: 'response_buffering', comment: '开启响应缓冲' })
  response_buffering: boolean;

  /**标签 */
  @Column({ type: 'text', name: 'tags', comment: '标签' })
  tags: string[];

  /**关联服务ID */
  @Column({ type: 'uuid', name: 'service_id', comment: '关联服务ID' })
  service: { id: string };
}

/**服务表 */
@Entity('kong_services')
export class KongCertificateEntity extends KongCertificateBaseEntity {
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

/**服务日志表 */
@Entity('kong_services_logs')
export class KongCertificateLogEntity extends KongCertificateBaseEntity {
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
