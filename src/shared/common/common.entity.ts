import { Column, AfterLoad } from 'typeorm';

/**通用实体基类 */
export abstract class CommonBaseEntity {
  /**更新用户ID */
  @Column({
    type: 'bigint',
    name: 'update_user_id',
    default: 0,
    comment: '更新用户ID',
  })
  updateUserId: number;

  /**更新时间 */
  @Column({ type: 'bigint', name: 'update_at', comment: '更新时间' })
  updateAt: number;

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

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  commonBaseLoad() {
    this.updateUserId = Number(this.updateUserId);
    this.updateAt = Number(this.updateAt);
    this.operateId = Number(this.operateId);
    this.reqId = Number(this.reqId);
  }
}
