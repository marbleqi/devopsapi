// 外部依赖
import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
// 内部依赖
import { CommonBaseEntity } from '../../shared';

/**KONG集群基类 */
export abstract class KubernetesClusterBaseEntity extends CommonBaseEntity {
  /**集群名 */
  @Column({ type: 'text', name: 'name', comment: '集群名' })
  name: string;

  /**集群说明 */
  @Column({ type: 'text', name: 'description', comment: '集群说明' })
  description: string;

  /**API接口地址 */
  @Column({ type: 'text', name: 'apiurl', comment: 'API接口地址' })
  apiurl: string;

  /**接口证书 */
  @Column({ type: 'text', name: 'cert', comment: '接口证书' })
  cert: string;

  /**接口密钥 */
  @Column({ type: 'text', name: 'key', comment: '接口密钥' })
  key: string;

  /**状态，1表示可用，0表示禁用 */
  @Column({ type: 'int', name: 'status', default: 1, comment: '状态' })
  status: number;
}

/**KONG集群表 */
@Entity('kubernetes_clusters')
export class KubernetesClusterEntity extends KubernetesClusterBaseEntity {
  /**集群ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'cluster_id',
    comment: '集群ID',
  })
  clusterId: number;

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
    this.clusterId = Number(this.clusterId);
    this.createUserId = Number(this.createUserId);
    this.createAt = Number(this.createAt);
  }
}

/**KONG集群日志表 */
@Entity('kubernetes_clusters_logs')
export class KubernetesClusterLogEntity extends KubernetesClusterBaseEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'log_id',
    comment: '日志序号',
  })
  logId: number;

  /**集群ID */
  @Column({ type: 'bigint', name: 'cluster_id', comment: '集群ID' })
  clusterId: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
    this.clusterId = Number(this.clusterId);
  }
}
