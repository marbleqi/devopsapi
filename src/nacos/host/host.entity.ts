import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**KONG站点基类 */
export abstract class NacosHostBaseEntity extends CommonBaseEntity {
  /**登陆名 */
  @Column({ type: 'text', name: 'name', comment: '站点名' })
  name: string;

  /**姓名 */
  @Column({ type: 'text', name: 'description', comment: '站点说明' })
  description: string;

  /**站点地址 */
  @Column({ type: 'text', name: 'url', comment: '站点地址' })
  url: string;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**用户表 */
@Entity('nacos_hosts')
export class NacosHostEntity extends NacosHostBaseEntity {
  /**站点ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'host_id',
    comment: '站点ID',
  })
  hostId: number;

  /**排序ID */
  @Column({ type: 'bigint', name: 'order_id', default: 0, comment: '排序ID' })
  orderId: number;

  /**创建用户ID */
  @Column({
    type: 'bigint',
    name: 'create_user_id',
    default: 1,
    comment: '创建用户ID',
  })
  createUserId: number;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'create_at', comment: '创建时间' })
  createAt: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.hostId = Number(this.hostId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**用户日志表 */
@Entity('nacos_hosts_logs')
export class NacosHostLogEntity extends NacosHostBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**用户ID */
  @Column({ type: 'bigint', name: 'host_id', comment: '站点ID' })
  hostId: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
    this.hostId = Number(this.hostId);
  }
}
