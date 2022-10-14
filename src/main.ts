// 外部依赖
import { NestFactory } from '@nestjs/core';
// 内部依赖
import { AppModule } from './app.module';

/**项目启动函数 */
async function bootstrap() {
  /**应用 */
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(parseInt(process.env.PORT, 10) || 80);
}
bootstrap();
