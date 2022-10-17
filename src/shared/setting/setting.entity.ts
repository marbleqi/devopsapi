import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  AfterLoad,
  BeforeInsert,
} from 'typeorm';
import { CommonBaseEntity } from '..';

/**设置表基类 */
export abstract class SettingBaseEntity extends CommonBaseEntity {
  /**配置值 */
  @Column({ type: 'json', name: 'value', comment: '值' })
  value: object;
}

/**设置表 */
@Entity('settings')
export class SettingEntity extends SettingBaseEntity {
  /**配置编码 */
  @PrimaryColumn({ type: 'text', name: 'code', comment: '配置编码' })
  code: string;

  /**创建用户ID */
  @Column({
    type: 'bigint',
    name: 'create_user_id',
    default: 0,
    comment: '创建用户ID',
  })
  createUserId: number;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'create_at', comment: '创建时间' })
  createAt: number;

  @AfterLoad()
  createLoad() {
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }

  @BeforeInsert()
  insertDate() {
    this.createAt = Date.now();
    this.createUserId = this.updateUserId;
  }
}

/**设置日志表 */
@Entity('settings_logs')
export class SettingLogEntity extends SettingBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**配置编码 */
  @Column({ type: 'text', name: 'code', comment: '配置编码' })
  code: string;
}
