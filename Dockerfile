# 制作基础镜像
FROM centos:7 AS base

# 设置工作目录
WORKDIR /data

# 升级软件包
RUN yum -y update \
  # 设置时区为上海
  && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  # 设置nodejs版本为16
  && curl --silent --location https://rpm.nodesource.com/setup_16.x | bash - \
  # 安装nodejs
  && yum install -y nodejs \
  # 设置使用npm淘宝源，在国外服务器上构建镜像时，可考虑注释
  && npm config set registry https://registry.npmmirror.com \
  && npm config set sass_binary_site=https://npmmirror.com/mirrors/node-sass/ \
  # 升级npm包
  && npm install -g npm \
  # 安装yarn包
  && npm install -g yarn \
  # 设置yarn的源为淘宝源
  && yarn config set registry https://registry.npmmirror.com -g \
  && yarn config set sass_binary_site http://cdn.npmmirror.com/dist/node-sass -g
COPY package.json .
RUN yarn install

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
