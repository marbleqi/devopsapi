import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
} from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**钉钉用户表基类 */
export abstract class WxworkUserBaseEntity extends CommonBaseEntity {
  /**用户ID */
  @Column({ type: 'bigint', name: 'user_id', comment: '用户ID' })
  userId: number;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**钉钉用户表 */
@Entity('wxwork_users')
export class WxworkUserEntity extends WxworkUserBaseEntity {
  /**企业微信用户ID */
  @PrimaryColumn({ type: 'text', name: 'wxwork_id', comment: '企业微信用户ID' })
  wxworkId: string;

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
  wxworkUserLoad() {
    this.userId = Number(this.userId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**钉钉用户日志表 */
@Entity('wxwork_users_logs')
export class WxworkUserLogEntity extends WxworkUserBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**企业微信用户ID */
  @Column({ type: 'text', name: 'wxwork_id', comment: '企业微信用户ID' })
  wxworkId: string;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  wxworkUserLoad() {
    this.logId = Number(this.logId);
    this.userId = Number(this.userId);
  }
}
