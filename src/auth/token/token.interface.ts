/**令牌接口 */
export interface Token {
  [key: string]: any;
  /**令牌 */
  token: string;
  /**令牌关联用户 */
  userid: number;
  /**令牌过期时间 */
  expired?: number;
}
