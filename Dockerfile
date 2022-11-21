# 制作基础镜像
FROM centos:7 AS base

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && yum install -y epel-release && yum -y update

# 设置工作目录
WORKDIR /data

# 设置nodejs版本为16
RUN curl --silent --location https://rpm.nodesource.com/setup_16.x | bash - \
  # 安装nodejs
  && yum install -y nodejs python3 make gcc gcc-c++ \
  # 升级npm包
  && npm i -g npm \
  # 安装yarn包
  && npm i -g yarn
COPY package.json .
RUN yarn

# 源码构建
FROM base AS build
COPY . .
RUN yarn run build

# 制作发布镜像
FROM base
# 复制编译后文件到发布镜像
COPY --from=build /data/dist ./dist

EXPOSE 80

CMD ["node","dist/main.js"]
