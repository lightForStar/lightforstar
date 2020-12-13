# SQL注入

## 概述
SQL是操作数据库数据的结构化查询语言，网页的应用数据和后台数据库中的数据进行交互时会采用SQL。而SQL注入是将Web页面的原URL、表单域或数据包输入的参数，修改拼接成SQL语句，传递给Web服务器，进而传给数据库服务器以执行数据库命令。如Web应用程序的开发人员对用户所输入的数据或cookie等内容不进行过滤或验证(即存在注入点)就直接传输给数据库，就可能导致拼接的SQL被执行，获取对数据库的信息以及提权，发生SQL注入攻击。

## 产生原因
使用参数拼接的方式组合sql

## 常见SQL注入的种类
1. 数字型 

2. 字符型

## Mybatis下的SQL注入案例（字符型）

xml文件
```xml
<select id="selectByName" resultType="com.hua.li.education.website.domain.Student">
select * from student
where username like '%${username}%'
</select>
 ```
 dao接口和controller
 ```java
 @Repository
public interface StudentMapper extends BaseDao<Student> {
    Student selectByEmail(@Param(value = "email") String email);
    List<Student> selectByName(@Param(value = "username")String username);
}
 ```
 ```java
@RequestMapping(value = "/testSqlInject")
@ResponseBody
public List<Student> getUser(String username){
    return studentMapper.selectByName(username);
}
 ```
 
 - **字符型注入的关键是闭合原有的引号，加上其他为真的查询条件**
 
正常情况下的查询语句

url：http://localhost:8080/user/testSqlInject?username=black
 
MyBtis拼接的sql语句： select * from student where username like '%black%' 

使用sql注入传参

url：http://localhost:8080/user/testSqlInject?username=' or '1'='1

MyBtis拼接的sql语句：select * from student where username like '%' or '1'='1%' 

- 可以看到我们上面使用了' or '1'='1进行sql注入，因为or 1=1永真所以会查出所有的数据，关键在于闭合单引号，注入永真条件


## 解决方案
### 方式一：把$改为#号，不使用拼接的方式。

eg：
```xml
<select id="selectByName" resultType="com.hua.li.education.website.domain.Student">
select * from student
where username like #{username}
</select>
 ```
- 这种方式不能进行模糊查询，只能进行精确查询

### 方式二：使用CONCAT函数
```
<select id="selectByName" resultType="com.hua.li.education.website.domain.Student">
select * from student
where username like CONCAT ('%',#{username},'%')
</select>
 ```
 - 使用这种方式可以避免字符串拼接，也能进行模糊查询


