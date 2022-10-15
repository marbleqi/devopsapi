import { Column, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';

/**通用实体基类 */
export abstract class CommonBaseEntity {
  /**更新用户ID */
  @Column({
    type: 'bigint',
    name: 'update_userid',
    default: 0,
    comment: '更新用户ID',
  })
  updateUserId: number;

  /**更新时间 */
  @Column({
    type: 'bigint',
    name: 'update_at',
    comment: '更新时间',
  })
  updateAt: number;

  /**操作序号 */
  @Column({
    type: 'bigint',
    name: 'operateid',
    default: 0,
    comment: '操作序号',
  })
  operateId: number;

  /**请求序号 */
  @Column({ type: 'bigint', name: 'reqid', default: 0, comment: '请求序号' })
  reqId: number;

  @AfterLoad()
  updateLoad() {
    this.updateUserId = Number(this.updateUserId);
    this.updateAt = Number(this.updateAt);
    this.operateId = Number(this.operateId);
    this.reqId = Number(this.reqId);
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateData() {
    this.updateAt = Date.now();
  }
}
