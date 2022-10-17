import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterLoad,
  BeforeInsert,
} from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**设置表基类 */
export abstract class MenuBaseEntity extends CommonBaseEntity {
  /**上级菜单ID */
  @Column({ type: 'bigint', name: 'p_menu_id', comment: '上级菜单ID' })
  pMenuId: number;
  /**菜单配置 */
  @Column({ type: 'json', name: 'config', comment: '菜单配置' })
  config: object;
  /**状态，1表示可用，0表示禁用 */
  @Column({
    type: 'bigint',
    name: 'status',
    default: 1,
    comment: '状态，1表示可用，0表示禁用',
  })
  status: number;
  /**创建时间 */
  @Column({ type: 'bigint', name: 'create_at', comment: '创建时间' })
  orderid: number;
  /**创建时间 */
  @Column({ type: 'bigint', name: 'create_at', comment: '创建时间' })
  abilities: object;
}

/**设置表 */
@Entity('menus')
export class MenuEntity extends MenuBaseEntity {
  /**菜单ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'menu_id',
    comment: '菜单ID',
  })
  menuId: number;

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
@Entity('menus_logs')
export class MenuLogEntity extends MenuBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**菜单ID */
  @Column({ type: 'bigint', name: 'menu_id', comment: '菜单ID' })
  menuid: number;
}
