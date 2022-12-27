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

/**微信商家表基类 */
export abstract class WechatMerchantBaseEntity extends CommonBaseEntity {
  /**企业微信ID */
  @Column({ type: 'text', name: 'app_id', comment: '企业微信ID' })
  appid: string;

  /**证书序列号 */
  @Column({ type: 'text', name: 'serial_no', comment: '证书序列号' })
  serial_no: string;

  /**证书cert */
  @Column({ type: 'text', name: 'cert', comment: '证书cert' })
  cert: string;

  /**证书key */
  @Column({ type: 'text', name: 'key', comment: '证书key' })
  key: string;

  /**企业微信密钥 */
  @Column({ type: 'text', name: 'secret', comment: '企业微信密钥' })
  secret: string;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**微信商家表 */
@Entity('wechat_merchants')
export class WechatMerchantEntity extends WechatMerchantBaseEntity {
  /**商家ID */
  @PrimaryColumn({ type: 'text', name: 'mch_id', comment: '商家ID' })
  mchid: string;

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
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**微信商家日志表 */
@Entity('wechat_merchants_logs')
export class WechatMerchantLogEntity extends WechatMerchantBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**商家ID */
  @Column({ type: 'text', name: 'mch_id', comment: '商家ID' })
  mchid: string;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
  }
}
