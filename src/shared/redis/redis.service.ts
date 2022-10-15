// 外部依赖
import { Injectable } from '@nestjs/common';
import { RedisKey } from 'ioredis/built/utils/RedisCommander';
import { RedisOptions } from 'ioredis';
import Redis from 'ioredis';

/**共享缓存服务（Redis） */
@Injectable()
export class RedisService {
  /**缓存连接对象 */
  private readonly redis: Redis;

  /**构造函数 */
  constructor() {
    // 进行配置参数验证
    if (!process.env.REDIS_HOST) {
      throw new Error('未配置缓存地址');
    }
    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
    const db = parseInt(process.env.REDIS_DB, 10) || 0;
    const password = process.env.REDIS_PSW || '';
    this.redis = new Redis({ host, port, db, password } as RedisOptions);
  }

  /**
   * 判断键是否存在
   * @param key 键
   * @returns 若 key 存在返回 1 ，否则返回 0
   */
  async exists(key: RedisKey): Promise<number> {
    return this.redis.exists(key);
  }

  /**
   * 返回符合条件的键数组
   * @param pattern 键值模式
   * @returns 符合给定模式的 key 列表 (Array)。
   */
  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  /**
   * 设置键的过期时间
   * @param key 键名
   * @param seconds 过期时间，单位秒
   * @returns 设置成功返回 1
   */
  async expire(key: RedisKey, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds);
  }

  /**
   * 设置键的过期时间
   * @param key 键名
   * @param milliseconds 过期时间，单位毫秒
   * @returns 设置成功返回 1
   */
  async pexpire(key: RedisKey, milliseconds: number): Promise<number> {
    return this.redis.pexpire(key, milliseconds);
  }

  /**
   * 获取字符串类型键的值
   * @param key 键名
   * @returns 返回 key 的值，如果 key 不是字符串类型，那么返回一个错误
   */
  async get(key: RedisKey): Promise<string> {
    return this.redis.get(key);
  }

  /**
   * 设置字符串类型键的值
   * @param key 键名
   * @param value 键值
   * @returns 设置操作成功完成时，返回 OK
   */
  async set(key: RedisKey, value: string | Buffer | number): Promise<'OK'> {
    return this.redis.set(key, value);
  }

  /**
   * 修改 key 的名称
   * @param oldkey 旧键名
   * @param newkey 新键名
   * @returns 当 OLD_KEY_NAME 和 NEW_KEY_NAME 相同，或者 OLD_KEY_NAME 不存在时，返回一个错误。 当 NEW_KEY_NAME 已经存在时， RENAME 命令将覆盖旧值
   */
  async rename(oldkey: RedisKey, newkey: RedisKey): Promise<'OK'> {
    return this.redis.rename(oldkey, newkey);
  }

  /**
   * 用于在新的 key 不存在时修改 key 的名称
   * @param oldkey 旧键名
   * @param newkey 新键名
   * @returns 修改成功时，返回 1 。 如果 NEW_KEY_NAME 已经存在，返回 0
   */
  async renamenx(oldkey: RedisKey, newkey: RedisKey): Promise<number> {
    return this.redis.renamenx(oldkey, newkey);
  }

  /**
   * 获取哈希类型键的值，并返回为对象
   * @param key 键名
   * @returns 键值
   */
  async hgetall(key: RedisKey): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  /**
   * 获取哈希类型键的某个字段的值
   * @param key 键名
   * @param field 字段名
   * @returns 键名下的字段值
   */
  async hget(key: RedisKey, field: string | Buffer): Promise<string> {
    return this.redis.hget(key, field);
  }

  /**
   * 设置哈希类型键的多个字段的值
   * @param key 键名
   * @param value 字段名和值
   * @returns
   */
  async hmset(
    key: RedisKey,
    ...value: (string | Buffer | number)[]
  ): Promise<'OK'> {
    return this.redis.hmset(key, ...value);
  }

  /**
   * 删除键
   * @param key 键名
   * @returns 被删除key的数量
   */
  async del(key: RedisKey): Promise<number> {
    return this.redis.del(key);
  }
}
