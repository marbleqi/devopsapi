// 外部依赖
import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';

/**操作序号表 */
@Entity('operates')
export class OperateEntity {
  /**操作序号 */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'operate_id',
    comment: '操作序号',
  })
  operateId: number;

  /**操作对象 */
  @Column({ type: 'text', name: 'operate_name', comment: '操作对象' })
  operateName: string;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'create_at', comment: '创建时间' })
  createAt: number;

  /**长整型数据返回时，进行数据转换 */
  @AfterLoad()
  operateLoad() {
    this.operateId = Number(this.operateId);
    this.createAt = Number(this.createAt);
  }
}
