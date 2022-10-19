import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
import { CommonBaseEntity } from '../../shared';

/**用户配置 */
export interface UserConfig {
  [key: string]: any;
  /**头像 */
  avatar?: string;
  /**电子邮箱 */
  email?: string;
  /**密码登陆 */
  pswLogin?: boolean;
  /**扫码登陆 */
  qrLogin?: boolean;
}

/**用户表基类 */
export abstract class UserBaseEntity extends CommonBaseEntity {
  /**登陆名 */
  @Column({ type: 'text', name: 'login_name', comment: '登陆名' })
  loginName: string;

  /**姓名 */
  @Column({ type: 'text', name: 'user_name', comment: '姓名' })
  userName: string;

  /**用户配置 */
  @Column({ type: 'json', name: 'config', comment: '用户配置' })
  config: UserConfig;

  /**状态，1表示可用，0表示禁用 */
  @Column({
    type: 'int',
    name: 'status',
    default: 1,
    comment: '状态，1表示可用，0表示禁用',
  })
  status: number;

  /**授权角色 */
  @Column({
    type: 'json',
    name: 'roles',
    default: [],
    comment: '授权角色',
  })
  roles: number[];

  /**用户密码 */
  @Column({ type: 'text', name: 'password', default: '', comment: '用户密码' })
  password: string;
}

/**用户表 */
@Entity('users')
export class UserEntity extends UserBaseEntity {
  /**用户ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
    comment: '用户ID',
  })
  userId: number;

  /**密码错误次数 */
  @Column({
    type: 'int',
    name: 'psw_times',
    default: 0,
    comment: '密码错误次数',
  })
  pswTimes: number;

  /**登陆次数 */
  @Column({
    type: 'bigint',
    name: 'login_times',
    default: 0,
    comment: '登陆次数',
  })
  loginTimes: number;

  /**首次登录时间 */
  @Column({
    type: 'bigint',
    name: 'first_login_at',
    default: 0,
    comment: '首次登录时间',
  })
  firstLoginAt: number;

  /**最后登录IP */
  @Column({
    type: 'text',
    name: 'last_login_ip',
    default: 0,
    comment: '最后登录IP',
  })
  lastLoginIp: string;

  /**最后登录时间 */
  @Column({
    type: 'bigint',
    name: 'last_login_at',
    default: 0,
    comment: '最后登录时间',
  })
  lastLoginAt: number;

  /**最后会话时间 */
  @Column({
    type: 'bigint',
    name: 'last_session_at',
    default: 0,
    comment: '最后会话时间',
  })
  lastSessionAt: number;

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
    this.pswTimes = Number(this.pswTimes);
    this.loginTimes = Number(this.loginTimes);
    this.firstLoginAt = Number(this.firstLoginAt);
    this.lastLoginAt = Number(this.lastLoginAt);
    this.lastSessionAt = Number(this.lastSessionAt);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**用户日志表 */
@Entity('users_logs')
export class UserLogEntity extends UserBaseEntity {
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
