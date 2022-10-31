/**前端对象属性字段 */
export interface Schema {
  /**可扩展字段 */
  [key: string]: any;
  /**属性名称 */
  name: string;
  /**属性类型 */
  type: string;
  /**显示标题 */
  title: string;
  /**默认值 */
  default?: any;
  /**必填 */
  required?: boolean;
}
