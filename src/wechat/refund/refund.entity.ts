// 外部依赖
import { Entity, Column, PrimaryColumn, AfterLoad } from 'typeorm';

/**微信商家退款记录表 */
@Entity('wechat_refunds')
export class WechatRefundEntity {
  /**微信退款单号 */
  @PrimaryColumn({ type: 'text', name: 'refund_id', comment: '微信退款单号' })
  refund_id: string;

  /**商家退款单号 */
  @Column({ type: 'text', name: 'out_refund_no', comment: '商家退款单号' })
  out_refund_no: string;

  /**微信订单号 */
  @Column({ type: 'text', name: 'transaction_id', comment: '微信订单号' })
  transaction_id: string;

  /**商家订单号 */
  @Column({ type: 'text', name: 'out_trade_no', comment: '商家订单号' })
  out_trade_no: string;

  /**退款渠道 */
  @Column({ type: 'text', name: 'channel', comment: '退款渠道' })
  channel: string;

  /**退款入账账户 */
  @Column({
    type: 'text',
    name: 'user_received_account',
    comment: '退款入账账户',
  })
  user_received_account: string;

  /**退款成功时间 */
  @Column({ type: 'text', name: 'success_time', comment: '退款成功时间' })
  success_time: string;

  /**退款创建时间 */
  @Column({ type: 'text', name: 'create_time', comment: '退款创建时间' })
  create_time: string;

  /**退款状态 */
  @Column({ type: 'text', name: 'status', comment: '退款状态' })
  status: string;

  /**资金账户 */
  @Column({ type: 'text', name: 'funds_account', comment: '资金账户' })
  funds_account: string;

  /**订单金额 */
  @Column({ type: 'int', name: 'total', comment: '订单金额' })
  total: number;

  /**退款金额 */
  @Column({ type: 'int', name: 'refund', comment: '退款金额' })
  refund: number;

  /**操作序号 */
  @Column({
    type: 'bigint',
    name: 'operate_id',
    default: 1,
    comment: '操作序号',
  })
  operateId: number;

  /**请求序号 */
  @Column({ type: 'bigint', name: 'req_id', default: 0, comment: '请求序号' })
  reqId: number;

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
    this.operateId = Number(this.operateId);
    this.reqId = Number(this.reqId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}
