// 外部依赖
import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
// 内部依赖
import { CommonBaseEntity } from '../../shared';

/**阿里云密钥基类 */
export abstract class AliyunAccesskeyBaseEntity extends CommonBaseEntity {
  /**密钥名 */
  @Column({ type: 'text', name: 'name', comment: '密钥名' })
  name: string;

  /**密钥说明 */
  @Column({ type: 'text', name: 'description', comment: '密钥说明' })
  description: string;

  /**accessKeyId */
  @Column({ type: 'text', name: 'access_key_id', comment: 'accessKeyId' })
  accessKeyId: string;

  /**accessKeySecret */
  @Column({
    type: 'text',
    name: 'access_key_secret',
    comment: 'accessKeySecret',
  })
  accessKeySecret: string;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**阿里云密钥表 */
@Entity('aliyun_keys')
export class AliyunAccesskeyEntity extends AliyunAccesskeyBaseEntity {
  /**密钥ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'key_id',
    comment: '密钥ID',
  })
  keyId: number;

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
    this.keyId = Number(this.keyId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**阿里云密钥日志表 */
@Entity('aliyun_keys_logs')
export class AliyunAccesskeyLogEntity extends AliyunAccesskeyBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**密钥ID */
  @Column({ type: 'bigint', name: 'key_id', comment: '密钥ID' })
  keyId: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
    this.keyId = Number(this.keyId);
  }
}
