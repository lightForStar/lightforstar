# 手写简易版mybatis

## jdbc连接数据库

**连接数据库的步骤(mysql)**

1. 加载驱动
2. 获取连接
3. 编写sql
4. 创建prepareStatement
5. 执行查询
6. 处理结果集
7. 关闭资源

**demo示例**

```java
package com.zgg.test.jdbc;

import java.sql.*;

public class JDBCDemo {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        PreparedStatement preparedStatement=null;
        Connection connection = null;
        ResultSet resultSet =null;
        try {
            //加载驱动
            Class.forName("com.mysql.jdbc.Driver");
            //获取连接
            connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/test?characterEncoding=utf-8","root","1726854135");
            //编写sql
            String sql = "select * from user";
            //创建prepareStatement
            preparedStatement = connection.prepareStatement(sql);
            //执行查询
            resultSet = preparedStatement.executeQuery();
            //遍历游标解析结果集
            while (resultSet.next()){
                System.out.println("id: "+resultSet.getString("id")+" username: "+resultSet.getString("name"));
            }
        }finally {
            //关闭资源
            resultSet.close();
            preparedStatement.close();
            connection.close();
        }

    }

}
```

### jdbc存在的缺陷

1. 连接数据库硬编码
2. 编写的sql硬编码
3. 业务无关的步骤太多，如获取连接、关闭资源等
4. 结果集解析复杂

## mybatis

### 简介

MyBatis 是一款优秀的持久层框架 ，它支持定制化SQL、存储过程以及高级映射。MyBatis 避免了几乎所有的JDBC代码和手动设置参数以及获取结果集，它可以使用简单的XML 或注解 来配置和映射SQL信息，将接口和Java 的POJOs(Plain Old Java Objects,普通的Java对象)映射成数据库中的记录。

### mybatis解决了哪些jdbc的不足？

1. 提供配置文件解决了数据库连接硬编码问题，更改配置文件既可以更换数据库
2. 使用mappper配置文件解决了sql硬编码问题，灵活的分离sql和业务代码
3. 封装连接的获取和资源关闭，我们只需要调用mybatis的api执行sql即可
4. 结果集封装为java对象，不需要我们解析ResultSet

### mybatis架构

![image-20200506002903900](E:\笔记\md-pic\image-20200506002903900.png)

接口层提供接口给开发人员调用，数据处理层完成对映射文件的解析和数据处理(sql执行和结果集封装),支撑层用来完成MyBaits与数据库基本连接方式以及SQL命令与配置文件对应。

### 架构流程图

![image-20200506100811325](E:\笔记\md-pic\image-20200506100811325.png)



**说明：**

1. mybatis配置文件
SqlMapConfig.xml，此文件作为mybatis的全局配置文件，配置了mybatis的运行环境和数据库等信息。
Mapper.xml，此文件作为mybatis的sql映射文件，文件中配置了操作数据库的sql语句。此文件需要在SqlMapConfig.xml中加载。
2. SqlSessionFactory
通过mybatis环境等配置信息构造SqlSessionFactory，即会话工厂。
3. sqlSession
通过会话工厂创建sqlSession即会话，程序员通过sqlsession会话接口对数据库进行增删改查操作。
4. Executor执行器
mybatis底层自定义了Executor执行器接口来具体操作数据库，Executor接口有
两个实现，一个是基本执行器（默认）、一个是缓存执行器，sqlsession底层是
通过executor接口操作数据库的。
5. Mapped Statement
它也是mybatis一个底层封装对象，它包装了mybatis配置信息及sql映射信息
等。mapper.xml文件中一个select\insert\update\delete标签对应一个
Mapped Statement对象，select\insert\update\delete标签的id即是Mapped
Statement的id。
Mapped Statement对sql执行输入参数进行定义，包括HashMap、基本类型、
pojo，Executor通过Mapped Statement在执行sql前将输入的java对象映射至sql
中，输入参数映射就是jdbc编程中对preparedStatement设置参数。
Mapped Statement对sql执行输出结果进行定义，包括HashMap、基本类型、
pojo，Executor通过Mapped Statement在执行sql后将输出结果映射至java对象
中，输出结果映射过程相当于jdbc编程中对结果的解析处理过程。

## 手写篇

手写我们关注mybatis解决的第一个问题--数据库连接硬编码问题

mybatis通过全局配置文件解决数据库连接硬编码问题

接下来的第一步便是解析配置文件，包括全局配置文件和sql对应的配置文件

引入dom4j解析xml