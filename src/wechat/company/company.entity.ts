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

/**微信商家企业微信基类 */
export abstract class WechatCompanyBaseEntity extends CommonBaseEntity {
  /**企业微信密钥 */
  @Column({ type: 'text', name: 'corp_secret', comment: '企业微信密钥' })
  corpsecret: string;

  /**说明 */
  @Column({ type: 'text', name: 'description', comment: '企业微信说明' })
  description: string;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**微信商家企业微信表 */
@Entity('wechat_companys')
export class WechatCompanyEntity extends WechatCompanyBaseEntity {
  /**企业微信ID */
  @PrimaryColumn({ type: 'text', name: 'corp_id', comment: '企业微信ID' })
  corpid: string;

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

/**KONG站点日志表 */
@Entity('wechat_companys_logs')
export class WechatCompanyLogEntity extends WechatCompanyBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**企业微信ID */
  @Column({ type: 'text', name: 'corp_id', comment: '企业微信ID' })
  corpid: string;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
  }
}
