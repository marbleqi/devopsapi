/**响应报文 */
export interface Result {
  [key: string]: any;
  /**响应码 */
  code: number;
  /**响应消息 */
  msg: string;
}
