// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, MoreThan } from 'typeorm';
// 内部依赖
import { Result, OperateService } from '../../shared';
import { MenuEntity, MenuLogEntity } from '..';

@Injectable()
export class MenuService {
  /**
   * 构造函数
   * @param queue 注入的队列服务
   * @param pg 注入的数据库服务
   */
  constructor(
    private readonly operateService: OperateService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 获取菜单清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**菜单清单 */
    const data: MenuEntity[] = await this.entityManager.findBy(MenuEntity, {
      operateId: MoreThan(operateId),
    });
    /**响应报文 */
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取菜单详情
   * @param menuId 菜单ID
   * @returns 响应消息
   */
  async show(menuId: number): Promise<Result> {
    /**菜单ID */
    if (!menuId) {
      return { code: 403, msg: '传入的菜单ID无效' };
    }
    /**菜单对象 */
    const data: MenuEntity = await this.entityManager.findOneBy(MenuEntity, {
      menuId,
    });
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到菜单' };
    }
  }

  /**
   * 获取菜单变更日志
   * @param menuId 菜单ID
   * @returns 响应消息
   */
  async log(menuId: number): Promise<Result> {
    /**菜单ID */
    if (!menuId) {
      return { code: 403, msg: '传入的菜单ID无效' };
    }
    /**菜单对象 */
    const data: MenuLogEntity[] = await this.entityManager.findBy(
      MenuLogEntity,
      {
        menuId,
      },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到菜单' };
    }
  }

  /**
   * 创建菜单
   * @param userid 用户ID
   * @param value 菜单信息
   * @returns 响应消息
   */
  async create(userid: number, value: object): Promise<Result> {
    const operateId = await this.operateService.set('setting');
    const menu = await this.entityManager.insert(MenuEntity, value);

    console.debug('菜单创建完成');
    return { code: 0, msg: '创建菜单成功', operateId };
  }

  /**
   * 更新菜单（含禁用和启用菜单）
   * @param userid 用户ID
   * @param id 菜单ID
   * @param value 提交消息体
   * @returns 响应消息
   */
  async update(userid: number, id: number, value: object): Promise<Result> {
    if (!id) {
      return { code: 403, msg: '传入的菜单ID无效' };
    }
    const operateId = await this.operateService.set('setting');

    const result = await this.entityManager.update(MenuEntity, { id }, value);

    return { code: 0, msg: '更新菜单成功', operateId };
  }

  /**
   * 菜单排序
   * @param value 提交消息体
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 403, msg: '没有待排序的菜单记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        MenuEntity,
        { id: item['menuid'] },
        { orderid: item['orderid'] },
      );
    }
    return { code: 0, msg: '菜单排序成功' };
  }
}
