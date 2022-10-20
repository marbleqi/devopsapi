/**用户信息DTO */
export class ReqDto {
  /**用户ID */
  userId: number;

  /**模块名 */
  module: string;

  /**控制器名 */
  controller: string;

  /**方法名 */
  action: string;

  /**状态码 */
  status: number;

  /**请求到达时间 */
  startAt: number[];
}
