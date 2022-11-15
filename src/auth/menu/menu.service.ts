// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
// 内部依赖
import {
  Result,
  OperateService,
  QueueService,
  CommonService,
} from '../../shared';
import { MenuEntity, MenuLogEntity, MenuDto } from '..';

@Injectable()
export class MenuService {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    private readonly queueService: QueueService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 获取菜单清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'menuId',
      'pMenuId',
      'link',
      'config',
      'status',
      'orderId',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<MenuEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<MenuEntity>;
    return await this.commonService.index(MenuEntity, select, where);
  }

  /**
   * 获取菜单详情
   * @param link 菜单链接
   * @returns 响应消息
   */
  async get(link: string): Promise<MenuEntity> {
    /**菜单对象 */
    return await this.entityManager.findOneBy(MenuEntity, {
      link,
    });
  }

  /**
   * 获取菜单详情
   * @param menuId 菜单ID
   * @returns 响应消息
   */
  async show(menuId: number): Promise<Result> {
    /**菜单ID */
    if (!menuId) {
      return { code: 400, msg: '传入的菜单ID无效' };
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
      return { code: 400, msg: '传入的菜单ID无效' };
    }
    /**菜单对象 */
    const data: MenuLogEntity[] = await this.entityManager.findBy(
      MenuLogEntity,
      { menuId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到菜单' };
    }
  }

  /**
   * 设置菜单
   * @param value 菜单信息

   * @returns 响应消息
   */
  async set(value: any): Promise<void> {
    const result = await this.get(value.link);
    if (!result) {
      await this.entityManager.insert(MenuEntity, value);
    }
  }

  /**
   * 创建菜单
   * @param value 菜单信息
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: MenuDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('menu');
    const result = await this.entityManager.insert(MenuEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      const menuId = Number(result.identifiers[0].menuId);
      this.eventEmitter.emit('menu', menuId);
      this.queueService.add('menu', menuId);
      return { code: 0, msg: '菜单创建完成', operateId, reqId, menuId };
    } else {
      return { code: 400, msg: '菜单创建失败', operateId, reqId };
    }
  }

  /**
   * 更新菜单（含禁用和启用菜单）
   * @param menuId 菜单ID
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    menuId: number,
    value: MenuDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!menuId) {
      return { code: 400, msg: '传入的菜单ID无效' };
    }
    const operateId = await this.operateService.insert('menu');
    const result = await this.entityManager.update(
      MenuEntity,
      { menuId },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('menu', menuId);
      this.queueService.add('menu', menuId);
      return { code: 0, msg: '更新菜单成功', operateId, reqId, menuId };
    } else {
      return { code: 400, msg: '更新菜单失败', operateId, reqId };
    }
  }

  /**
   * 菜单排序
   * @param value 提交消息体
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    console.debug('待排序菜单数据', value);
    if (!value.length) {
      return { code: 400, msg: '没有待排序的菜单记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        MenuEntity,
        { menuId: item['menuId'] },
        { orderId: item['orderId'] },
      );
    }
    this.queueService.add('menu', 'sort');
    return { code: 0, msg: '菜单排序成功' };
  }

  /**
   * 获取已授权权限点ID的菜单ID清单
   * @param id 权限点ID
   * @returns 响应消息
   */
  async granted(id: number): Promise<Result> {
    /**菜单清单 */
    const menus: MenuEntity[] = await this.entityManager.find(MenuEntity, {
      select: ['menuId', 'abilities'],
    });
    /**已授权菜单清单 */
    const data: number[] = menus
      .filter((menu) => menu.abilities.includes(id))
      .map((menu) => menu.menuId);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 对提交的对象清单授权权限点，并对其余的对象取消权限点授权
   * @param id 权限点ID
   * @param menuIds 需要授权的菜单ID集合
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async grant(
    id: number,
    menuIds: number[],
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**菜单清单 */
    const menus: MenuEntity[] = await this.entityManager.find(MenuEntity, {
      select: ['menuId', 'abilities'],
    });
    for (const menu of menus) {
      // 增加菜单的权限
      if (!menu.abilities.includes(id) && menuIds.includes(menu.menuId)) {
        const operateId = await this.operateService.insert('menu');
        menu.abilities.push(id);
        await this.entityManager.update(
          MenuEntity,
          { menuId: menu.menuId },
          {
            abilities: menu.abilities,
            operateId,
            reqId,
            updateUserId,
            updateAt: Date.now(),
          },
        );
        this.eventEmitter.emit('menu', menu.menuId);
      }
      // 删除菜单的权限
      if (menu.abilities.includes(id) && !menuIds.includes(menu.menuId)) {
        const operateId = await this.operateService.insert('menu');
        menu.abilities = menu.abilities.filter((item) => item !== id);
        await this.entityManager.update(
          MenuEntity,
          { menuId: menu.menuId },
          {
            abilities: menu.abilities,
            operateId,
            reqId,
            updateUserId,
            updateAt: Date.now(),
          },
        );
        this.eventEmitter.emit('menu', menu.menuId);
      }
    }
    this.queueService.add('menu', 'grant');
    return { code: 0, msg: '权限点授权成功' };
  }

  /**
   * 增加菜单修改日志
   * @param menuId 菜单ID
   */
  @OnEvent('menu')
  async addLog(menuId: number) {
    /**菜单对象 */
    const menu = await this.entityManager.findOneBy(MenuEntity, { menuId });
    /**添加日志 */
    this.entityManager.insert(MenuLogEntity, menu);
  }
}
