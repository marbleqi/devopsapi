// 外部依赖
import { Injectable } from '@nestjs/common';

/**共享通用服务 */
@Injectable()
export class CommonService {
  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @returns 指定长度的随机字符串
   */
  random(length: number): string {
    let i = 0;
    const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890`;
    const maxPos = chars.length;
    let result = '';
    while (i < length) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
      i++;
    }
    return result;
  }
}
