import { IsNotEmpty } from 'class-validator';

/**微信商户DTO */
export class CompanyDto {
  /**商户ID */
  @IsNotEmpty({ message: '商户ID不能为空' })
  mchid: string;

  /**企业微信ID */
  @IsNotEmpty({ message: '企业微信ID不能为空' })
  appid: string;

  /**证书cert */
  @IsNotEmpty({ message: '证书cert不能为空' })
  cert: string;

  /**证书key */
  @IsNotEmpty({ message: '证书key不能为空' })
  key: string;

  /**API密钥 */
  @IsNotEmpty({ message: 'API密钥不能为空' })
  secret: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '状态不能为空' })
  status: number;
}
