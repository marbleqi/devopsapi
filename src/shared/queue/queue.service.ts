// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectQueue, Processor, OnGlobalQueueWaiting } from '@nestjs/bull';
import { Queue, Job, JobStatus } from 'bull';
import { Subject } from 'rxjs';
// 内部依赖
import { Result } from '..';

/**共享队列服务 */
@Injectable()
@Processor('shared')
export class QueueService {
  /**前端消息订阅主体 */
  websub: Subject<{ name: string; data?: any }>;
  /**后端消息订阅主体 */
  apisub: Subject<string>;

  /**
   * 构造函数
   * @param pg 注入的数据库服务
   * @param queue 注入的队列服务
   */
  constructor(@InjectQueue('shared') private readonly queue: Queue) {
    this.websub = new Subject<{ name: string; data?: any }>();
    this.apisub = new Subject<string>();
  }

  /**
   * 生产任务（队列对象）
   * @param name 任务名称
   * @param data 任务数据
   */
  async add(name: string, data: any): Promise<void> {
    await this.queue.add(name, data);
  }

  /**
   * 获取任务清单
   * @param condition 队列配置
   * @returns 响应消息
   */
  async index(condition: any): Promise<Result> {
    const joblist: Job<any>[] = await this.queue.getJobs(
      condition.types as JobStatus[],
      condition.start || undefined,
      condition.end || undefined,
      condition.asc || undefined,
    );
    const data = joblist.map((job: Job<any>) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      timestamp: job.timestamp,
    }));
    return {
      code: 0,
      msg: 'ok',
      data,
    };
  }

  /**
   * 删除任务
   * @param condition 任务配置
   * @returns 响应消息
   */
  async remove(condition: any): Promise<Result> {
    for (const id of condition.idlist) {
      const job = await this.queue.getJob(id);
      await job.remove();
    }
    return { code: 0, msg: 'ok' };
  }

  /**
   * 清理任务
   * @returns 响应消息
   */
  async clean(): Promise<Result> {
    console.debug('启动任务清理');
    await this.queue.clean(1000, 'completed');
    await this.queue.clean(1000, 'failed');
    console.debug('完成任务清理');
    return { code: 0, msg: 'ok' };
  }

  /**
   * 收到设置变更通知，通知所有后端配置信息更新
   * @param job 任务
   */
  @OnGlobalQueueWaiting({ name: 'setting' })
  async setting(job: Job): Promise<void> {
    console.debug('通知所有后端配置信息更新！', job.name, job.data);
    this.apisub.next('setting');
  }
}
