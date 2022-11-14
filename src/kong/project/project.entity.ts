// 外部依赖
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  AfterLoad,
} from 'typeorm';
// 内部依赖
import { CommonBaseEntity } from '../../shared';

/**KONG站点基类 */
export abstract class KongProjectBaseEntity extends CommonBaseEntity {
  /**对象配置 */
  @Column({ type: 'jsonb', name: 'config', comment: '对象配置' })
  config: any;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**KONG站点表 */
@Entity('kong_projects')
export class KongProjectEntity extends KongProjectBaseEntity {
  /**站点ID */
  @PrimaryColumn({ type: 'bigint', name: 'host_id', comment: '站点ID' })
  hostId: number;

  /**对象类型 */
  @PrimaryColumn({ type: 'text', name: 'project_type', comment: '对象类型' })
  projectType: string;

  /**服务ID */
  @PrimaryColumn({ type: 'uuid', name: 'id', comment: '对象ID' })
  id: string;

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
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**KONG站点日志表 */
@Entity('kong_projects_logs')
export class KongProjectLogEntity extends KongProjectBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**站点ID */
  @Column({ type: 'bigint', name: 'host_id', comment: '站点ID' })
  hostId: number;

  /**对象类型 */
  @Column({ type: 'text', name: 'project_type', comment: '对象类型' })
  projectType: string;

  /**对象ID */
  @Column({ type: 'uuid', name: 'id', comment: '对象ID' })
  id: string;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
  }
}
