/**令牌接口 */
export interface Token {
  [key: string]: any;
  /**令牌 */
  token: string;
  /**令牌关联用户 */
  userId: number;
  /**令牌过期时间 */
  expired?: number;
}

/**认证结果接口 */
export interface Auth {
  /**用户ID */
  userId: number;
  /**权限无效标记 */
  invalid: boolean;
}
