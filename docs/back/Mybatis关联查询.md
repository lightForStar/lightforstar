# Mybatis关联查询

对象与对象之间的关系有一对一、一对多、多对多三种

## 一对一

一对一的关系时最简单的，在数据库中表的关系通常是用一个外键关联，例如一个人对应一个身份证，在人的表里会有身份证id



## 一对多

一对多指的是一个对象对应着多个对象，例如一个人对应着他写作的多篇文章，在数据库的表中，通常是在多的那一方加上外键，例如在文章表里加上人的id标识这篇文章属于谁

一对多在mybatis中有两种查询方式，一种是使用一条sql通过连接的方式直接查询，另一种是写两条sql一条是主表的例如人的表，另一条是从表的例如文章表，通过嵌套查询的方式查出来



采取连接查询的方式如果需要分页那么由于一对多的影响，你可能只是想要以主表为主进行分页，但是由于连接查询会把从表的多条记录和主表一起关联，那么这样就会导致你的分页数据不准确，解决的办法是使用第二种嵌套查询的方式，先查主表以主表为分页维度，再查从表，将从表的数据关联到主表中。



```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.zgg.qqlogindemo.mapper.PersonMapper">
  <resultMap id="BaseResultMap" type="com.zgg.qqlogindemo.model.Person">
    <!--@mbg.generated-->
    <!--@Table person-->
    <id column="id" jdbcType="VARCHAR" property="id" />
    <result column="name" jdbcType="VARCHAR" property="name" />
    <result column="age" jdbcType="INTEGER" property="age" />
  </resultMap>
  <sql id="Base_Column_List">
    <!--@mbg.generated-->
    id, `name`, age
  </sql>
	<!--连接的方式对应的映射关联 -->
  <resultMap id="Map" type="com.zgg.qqlogindemo.model.Person">
    <!--@mbg.generated-->
    <!--@Table person-->
    <id column="id" jdbcType="VARCHAR" property="id" />
    <result column="name" jdbcType="VARCHAR" property="name" />
    <result column="age" jdbcType="INTEGER" property="age" />
    <collection property="articles" ofType="com.zgg.qqlogindemo.model.Article">
      <id column="article_id" jdbcType="INTEGER" property="articleId" />
      <result column="titile" jdbcType="VARCHAR" property="titile" />
      <result column="person_id" jdbcType="INTEGER" property="personId" />
    </collection>
  </resultMap>

	<!--嵌套的方式对应的映射关联 -->
  <resultMap id="Map1" type="com.zgg.qqlogindemo.model.Person">
    <!--@mbg.generated-->
    <!--@Table person-->
    <id column="id" jdbcType="VARCHAR" property="id" />
    <result column="name" jdbcType="VARCHAR" property="name" />
    <result column="age" jdbcType="INTEGER" property="age" />
    <collection property="articles" ofType="com.zgg.qqlogindemo.model.Article" select="selectArticle" column="id">
      <id column="article_id" jdbcType="INTEGER" property="articleId" />
      <result column="titile" jdbcType="VARCHAR" property="titile" />
      <result column="person_id" jdbcType="INTEGER" property="personId" />
    </collection>
  </resultMap>

	
  <select id="selectPersonWithArticle" resultMap="Map">
    select * from person p left join article  a on p.id = a.person_id
  </select>
```

