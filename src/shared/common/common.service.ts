// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  ObjectLiteral,
  EntityTarget,
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';
// 内部依赖
import { Result } from '..';

/**共享通用服务 */
@Injectable()
export class CommonService {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

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

  /**
   * 针对指定实体列表，返回响应报文（删除不返回字段）
   * @param entityClass 实体类型
   * @param select 字段清单
   * @param where 搜索条件
   * @returns 响应消息
   */
  async index<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    select: FindOptionsSelect<Entity>,
    where?: FindOptionsWhere<Entity>,
  ): Promise<Result> {
    /**菜单清单 */
    let objectList: Entity[];
    if (where) {
      objectList = await this.entityManager.find(entityClass, {
        select,
        where,
      });
    } else {
      objectList = await this.entityManager.find(entityClass, {
        select,
      });
    }
    /**响应报文 */
    return {
      code: 0,
      msg: 'ok',
      data: objectList.map((item) => {
        const result: any = {};
        for (const key of select as unknown as string[]) {
          result[key] = item[key];
        }
        return result;
      }),
    };
  }

  /**
   * 针对指定实体对象，返回响应报文（删除不返回字段）
   * @param entityClass 实体类型
   * @param select 字段清单
   * @param where 搜索条件
   * @returns 响应消息
   */
  async show<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    select: FindOptionsSelect<Entity>,
    where: FindOptionsWhere<Entity>,
  ): Promise<Result> {
    /**菜单清单 */
    const objectItem: Entity = await this.entityManager.findOne(entityClass, {
      select,
      where,
    });
    if (objectItem) {
      const data: any = {};
      for (const key of select as unknown as string[]) {
        data[key] = objectItem[key];
      }
      /**响应报文 */
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }
}
