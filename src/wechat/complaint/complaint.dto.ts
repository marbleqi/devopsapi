import { IsNotEmpty } from 'class-validator';

/**投诉回复DTO */
export class ResponseDto {
  /**被诉商户号 */
  @IsNotEmpty({ message: '被诉商户号不能为空' })
  complainted_mchid: string;

  /**回复内容 */
  @IsNotEmpty({ message: '回复内容不能为空' })
  response_content: string;
}

/**投诉完成DTO */
export class CompleteDto {
  /**被诉商户号 */
  @IsNotEmpty({ message: '被诉商户号不能为空' })
  complainted_mchid: string;
}
