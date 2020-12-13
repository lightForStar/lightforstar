# docker-compose

## 简介

Compose 项目是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排，简单说docker-compose的出现是为了管理多个容器中的应用，例如要实现一个 Web 项目，除了 Web 服务容器本身，往往还需要再加上后端的数据库服务容器，甚至还包括负载均衡容器等。开源地址：https://github.com/docker/compose 

## Docker Compose 安装

安装命令(官网：https://github.com/docker/compose/releases)

```txt
curl -L https://get.daocloud.io/docker/compose/releases/download/1.26.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

linux环境uname命令可显示电脑和操作系统相关信息。uname -s显示操作系统名称；uname -m显示电脑类型。



验证是否安装成功

```shell
root@zgg:~# docker-compose --version
docker-compose version 1.26.2, build eefe0d31
```





## 常用命令

```shell
docker-compose -h                           # 查看帮助

docker-compose up                           # 创建并运行所有容器
docker-compose up -d                        # 创建并后台运行所有容器
docker-compose -f docker-compose.yml up -d  # 指定模板
docker-compose down                         # 停止并删除容器、网络、卷、镜像。

docker-compose logs       # 查看容器输出日志
docker-compose pull       # 拉取依赖镜像
dokcer-compose config     # 检查配置
dokcer-compose config -q  # 检查配置，有问题才有输出

docker-compose restart   # 重启服务
docker-compose start     # 启动服务
docker-compose stop      # 停止服务
```

​	