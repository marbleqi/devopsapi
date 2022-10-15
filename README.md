# 项目说明

基于 NestJS 框架搭建的运维管理平台后端

注：项目全程开源，记录个人的学习过程，督促自己学习进步

## 开发工具下载

VSCode 安装包：[下载地址](https://code.visualstudio.com/)
Nodejs 安装包：[下载地址](https://nodejs.org/en/download/)

## 开发环境准备

上述开发工具下载安装完成后，执行一下命令完成开发环境配置

```bash
# 调整npm包源为淘宝源
npm config set registry https://registry.npmmirror.com
npm config set sass_binary_site=https://npmmirror.com/mirrors/node-sass/

# 升级npm版本
npm i -g npm

# 安装yarn包
npm install -g yarn

# 设置yarn的源为淘宝源
yarn config set registry https://registry.npmmirror.com -g
yarn config set sass_binary_site http://cdn.npmmirror.com/dist/node-sass -g

# 安装nestjs脚手架
yarn global add @nestjs/cli

# 使用脚手架命令初始化项目(指定包管理器为yarn，安装依赖包，但不跳过git初始化)
nest new -p yarn devopsapi

cd devopsapi

# 安装@nestjs相关包
yarn add @nestjs/config @nestjs/axios @nestjs/platform-socket.io @nestjs/websockets @nestjs/bull @nestjs/schedule

# 安装验证相关包
yarn add class-validator class-transformer

# 安装mapped-types
yarn add @nestjs/mapped-types

# 安装typeorm
yarn add @nestjs/typeorm typeorm pg

# 安装其他开发包
yarn add date-fns ioredis xml2js mysql

# 安装相关开发依赖包
yarn add --dev @types/pg @types/ioredis @types/socket.io @types/xml2js

```
