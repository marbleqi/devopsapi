/**权限点接口 */
export interface Ability {
  /**权限点ID */
  id: number;
  /**上级权限点ID */
  pid: number;
  /**权限点名称 */
  name: string;
  /**权限点说明 */
  description: string;
  /**所属模块 */
  moduleName: string;
  /**所属对象 */
  objectName?: string;
  /**权限点类型 */
  type: string;
}
