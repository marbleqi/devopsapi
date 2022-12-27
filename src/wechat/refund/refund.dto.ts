import { IsNotEmpty } from 'class-validator';

/**退款DTO */
export class RefundDto {
  /**商家ID */
  @IsNotEmpty({ message: '商家ID不能为空' })
  mchid: string;

  /**商家订单号 */
  @IsNotEmpty({ message: '商家订单号不能为空' })
  out_trade_no: string;

  /**订单金额 */
  @IsNotEmpty({ message: '订单金额不能为空' })
  amount: number;

  /**退款金额 */
  @IsNotEmpty({ message: '退款金额不能为空' })
  refund: number;
}
