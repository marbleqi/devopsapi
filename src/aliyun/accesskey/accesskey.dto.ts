import { IsNotEmpty } from 'class-validator';

/**授权信息DTO */
export class AccesskeyDto {
  /**密钥名 */
  @IsNotEmpty({ message: '密钥名不能为空' })
  name: string;

  /**密钥说明 */
  @IsNotEmpty({ message: '密钥说明不能为空' })
  description: string;

  /**accessKeyId */
  accessKeyId?: string;

  /**accessKeySecret */
  accessKeySecret?: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '密钥状态不能为空' })
  status: number;
}
