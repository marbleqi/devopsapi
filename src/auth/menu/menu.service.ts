// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
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
import { MenuConfig, MenuEntity, MenuLogEntity } from '..';

@Injectable()
export class MenuService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    private readonly queueService: QueueService,
    private readonly commonService: CommonService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    const count: number = await this.entityManager.count(MenuEntity);
    if (!count) {
      console.debug('需要执行菜单初始化');
      const params = {
        updateUserId: 1,
        updateAt: Date.now(),
        createUserId: 1,
        createAt: Date.now(),
      };
      await this.entityManager.insert(MenuEntity, [
        {
          ...params,
          pMenuId: 0,
          config: {
            text: '系统管理',
            description: '系统管理',
            link: 'sys',
            reuse: true,
            isLeaf: false,
            icon: 'form',
          } as MenuConfig,
          abilities: [100],
        },
        {
          ...params,
          pMenuId: 0,
          config: {
            text: '访问控制',
            description: '访问控制',
            link: 'auth',
            reuse: true,
            isLeaf: false,
            icon: 'form',
          },
          abilities: [200],
        },
        {
          ...params,
          pMenuId: 0,
          config: {
            text: '企业微信',
            description: '企业微信',
            link: 'wxwork',
            reuse: true,
            isLeaf: false,
            icon: 'coffee',
          },
          abilities: [300],
        },
        {
          ...params,
          pMenuId: 0,
          config: {
            text: '钉钉',
            description: '钉钉',
            link: 'dingtalk',
            reuse: true,
            isLeaf: false,
            icon: 'dingtalk',
          },
          abilities: [400],
        },
        {
          ...params,
          pMenuId: 0,
          config: {
            text: '常用',
            description: '常用功能',
            link: 'common',
            reuse: true,
            isLeaf: false,
            icon: 'coffee',
          },
          abilities: [],
        },
        {
          ...params,
          pMenuId: 1,
          config: {
            text: '参数设置',
            description: '参数设置',
            link: '/sys/setting',
            reuse: true,
            isLeaf: true,
            icon: 'form',
          },
          abilities: [110],
        },
        {
          ...params,
          pMenuId: 1,
          config: {
            text: '日志管理',
            description: '日志管理',
            link: '/sys/req',
            reuse: true,
            isLeaf: true,
            icon: 'unordered-list',
          },
          abilities: [120],
        },
        {
          ...params,
          pMenuId: 1,
          config: {
            text: '队列管理',
            description: '队列管理',
            link: '/sys/queue',
            reuse: true,
            isLeaf: true,
            icon: 'ordered-list',
          },
          abilities: [130],
        },
        {
          ...params,
          pMenuId: 2,
          config: {
            text: '权限点管理',
            description: '权限点管理',
            link: '/auth/ability',
            reuse: true,
            isLeaf: true,
            icon: 'safety-certificate',
          },
          abilities: [210],
        },
        {
          ...params,
          pMenuId: 2,
          config: {
            text: '菜单管理',
            description: '菜单管理',
            link: '/auth/menu',
            reuse: true,
            isLeaf: true,
            icon: 'menu',
          },
          abilities: [220],
        },
        {
          ...params,
          pMenuId: 2,
          config: {
            text: '角色管理',
            description: '角色管理',
            link: '/auth/role',
            reuse: true,
            isLeaf: true,
            icon: 'team',
          },
          abilities: [230],
        },
        {
          ...params,
          pMenuId: 2,
          config: {
            text: '用户管理',
            description: '用户管理',
            link: '/auth/user',
            reuse: true,
            isLeaf: true,
            icon: 'user',
          },
          abilities: [240],
        },
        {
          ...params,
          pMenuId: 2,
          config: {
            text: '令牌管理',
            description: '令牌管理',
            link: '/auth/token',
            reuse: true,
            isLeaf: true,
            icon: 'key',
          },
          abilities: [250],
        },
        {
          ...params,
          pMenuId: 3,
          config: {
            text: '参数设置',
            description: '参数设置',
            link: '/wxwork/setting',
            reuse: true,
            isLeaf: true,
            icon: 'unordered-list',
          },
          abilities: [310],
        },
        {
          ...params,
          pMenuId: 4,
          config: {
            text: '参数设置',
            description: '参数设置',
            link: '/dingtalk/setting',
            reuse: true,
            isLeaf: true,
            icon: 'unordered-list',
          },
          abilities: [410],
        },
        {
          ...params,
          pMenuId: 5,
          config: {
            text: '导航',
            description: '导航',
            link: '/common/home',
            reuse: true,
            isLeaf: true,
            icon: 'appstore',
          },
          abilities: [],
        },
      ]);
    }
  }

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
   * 创建菜单
   * @param value 菜单信息
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: object,
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
      this.queueService.add('create', { object: 'menu' });
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
    value: object,
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
      this.queueService.add('update', { object: 'menu' });
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
    this.queueService.add('sort', { object: 'menu' });
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
    console.debug('grantedmenus', menus);
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
    console.debug('grantmenus', menus);
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
    return { code: 0, msg: '权限点授权成功' };
  }

  /**
   * 增加菜单修改日志
   * @param menuId 菜单ID
   */
  @OnEvent('menu')
  async addLog(menuId: number) {
    /**菜单对象 */
    const menu = await this.entityManager.findOneBy(MenuEntity, {
      menuId,
    });
    const result = await this.entityManager.insert(MenuLogEntity, menu);
    console.debug('result', result);
  }
}
