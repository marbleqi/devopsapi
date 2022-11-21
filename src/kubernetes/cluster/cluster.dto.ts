import { IsNotEmpty } from 'class-validator';

/**集群信息DTO */
export class ClusterDto {
  /**集群名 */
  @IsNotEmpty({ message: '集群名不能为空' })
  name: string;

  /**集群说明 */
  @IsNotEmpty({ message: '集群说明不能为空' })
  description: string;

  /**集群地址 */
  @IsNotEmpty({ message: '集群地址不能为空' })
  apiurl: string;

  /**接口证书 */
  cert?: string;

  /**接口密钥 */
  key?: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '集群状态不能为空' })
  status: number;
}
