#!/bin/bash

# 发布到演示环境下的脚本
set -e

echo "拉取最新版本镜像！"
docker pull registry.cn-beijing.aliyuncs.com/marbleqi/devopsapi

echo "如果已有应用容器运行，则删除该容器拉取最新版本镜像！"
for containerid in $(docker ps --format 'table {{.ID}}\t{{.Names}}' | grep 'demo-devopsapi' | awk '{print $1}')
do
  docker rm -f ${containerid}
done

# 启动新容器
docker run \
-dit \
--name demo-devopsapi \
--hostname demo-devopsapi \
-e NODE_ENV=demo \
-e POSTGRES_HOST=172.18.88.2 \
-e POSTGRES_DB=devops \
-e POSTGRES_USER=devops \
-e POSTGRES_PSW=devops \
-e REDIS_HOST=172.18.88.3 \
--network demo-net \
--ip 172.18.88.111 \
registry.cn-beijing.aliyuncs.com/marbleqi/devopsapi
