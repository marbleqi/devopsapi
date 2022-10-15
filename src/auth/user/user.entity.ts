import { Column } from 'typeorm';

/**通用实体基类 */
export abstract class UserEntity {
  /**创建用户ID */
  @Column({ type: 'bigint', name: 'create_userid', comment: '创建用户ID' })
  createUserId: number;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'create_at', comment: '创建时间' })
  createAt: number;
}
