// 外部依赖
import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
} from 'typeorm';
// 内部依赖
import { CommonBaseEntity } from '../../shared';

/**KONG授权基类 */
export abstract class KongGrantBaseEntity extends CommonBaseEntity {
  /**授权配置 */
  @Column({ type: 'jsonb', name: 'grant', comment: '授权配置' })
  grant: any;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**KONG授权表 */
@Entity('kong_grants')
export class KongGrantEntity extends KongGrantBaseEntity {
  /**用户ID */
  @PrimaryColumn({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  userId: number;

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
    this.userId = Number(this.userId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**KONG授权日志表 */
@Entity('kong_grants_logs')
export class KongGrantLogEntity extends KongGrantBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**用户ID */
  @Column({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  userId: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
    this.userId = Number(this.userId);
  }
}
