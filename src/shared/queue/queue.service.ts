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
  webSub: Subject<{ name: string; data: any }>;
  /**后端消息订阅主体 */
  apiSub: Subject<{ name: string; data: any }>;

  /**
   * 构造函数
   * @param queue 注入的队列服务
   */
  constructor(@InjectQueue('shared') private readonly queue: Queue) {
    this.webSub = new Subject<{ name: string; data: any }>();
    this.apiSub = new Subject<{ name: string; data: any }>();
  }

  /**
   * 生产任务（队列对象）
   * @param name 任务名称
   * @param data 任务数据
   */
  async add(name: string, data: any): Promise<void> {
    console.debug(name, data);
    await this.queue.add(name, data);
  }

  /**
   * 获取任务清单
   * @param condition 队列过滤条件
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
   * @param condition 任务ID清单
   * @returns 响应消息
   */
  async remove(condition: any): Promise<Result> {
    for (const id of condition.idlist) {
      const job = await this.queue.getJob(id);
      job.remove();
    }
    return { code: 0, msg: 'ok' };
  }

  /**
   * 清理任务
   * @returns 响应消息
   */
  async clean(): Promise<Result> {
    await this.queue.clean(1000, 'completed');
    await this.queue.clean(1000, 'failed');
    return { code: 0, msg: 'ok' };
  }

  /**
   * 收到队列通知
   * @param job 任务
   */
  @OnGlobalQueueWaiting()
  async waiting(jobId: number): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (job.name === 'menu') {
      // 菜单类变更通知所有前端
      this.webSub.next({ name: 'menu', data: job.data });
    } else {
      // 其余变更通知所有后端
      this.apiSub.next({ name: job.name, data: job.data });
    }
  }
}
