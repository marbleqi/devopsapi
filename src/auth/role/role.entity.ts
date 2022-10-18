import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**角色表基类 */
export abstract class RoleBaseEntity extends CommonBaseEntity {
  /**角色配置 */
  @Column({ type: 'json', name: 'config', comment: '角色配置' })
  config: object;

  /**状态，1表示可用，0表示禁用 */
  @Column({
    type: 'int',
    name: 'status',
    default: 1,
    comment: '状态，1表示可用，0表示禁用',
  })
  status: number;

  /**授权权限点 */
  @Column({
    type: 'json',
    name: 'abilities',
    default: [],
    comment: '授权权限点',
  })
  abilities: number[];
}

/**角色表 */
@Entity('roles')
export class RoleEntity extends RoleBaseEntity {
  /**角色ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'role_id',
    comment: '角色ID',
  })
  roleId: number;

  /**排序ID */
  @Column({ type: 'bigint', name: 'order_id', default: 0, comment: '排序ID' })
  orderId: number;

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

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  roleLoad() {
    this.roleId = Number(this.roleId);
    this.orderId = Number(this.orderId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**角色日志表 */
@Entity('roles_logs')
export class RoleLogEntity extends RoleBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**角色ID */
  @Column({ type: 'bigint', name: 'role_id', comment: '角色ID' })
  roleId: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  roleLoad() {
    this.logId = Number(this.logId);
    this.roleId = Number(this.roleId);
  }
}
