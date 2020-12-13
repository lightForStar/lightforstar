# mybatis批量删除

- 说明：删除id在某个范围内的用户数据

- 实体类
```java
package com.zgg.shop.domian;

import java.io.Serializable;
import java.util.Date;

/**
 * Created by Z先生 on 2020/1/13.
 */
public class TbUser implements Serializable {
    private Long id;
    private String username;
    private String password;
    private String phone;
    private String email;
    private Date created;
    private Date updated;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getUpdated() {
        return updated;
    }

    public void setUpdated(Date updated) {
        this.updated = updated;
    }

    @Override
    public String toString() {
        return "TbUser{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", created=" + created +
                ", updated=" + updated +
                '}';
    }
}
```


- mapper的xml映射文件
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.zgg.shop.web.admin.dao.TbUserDao">
    <sql id="tbUserColumns">
          a.id,
          a.username,
          a.password,
          a.phone,
          a.email,
          a.created,
          a.updated
    </sql>

    <!-- forEach : 用来循环 collection : 用来指定循环的数据的类型 可以填的值有：array,list,map item: 循环中为每个循环的数据指定一个别名 
    index : 循环中循环的下标 
    open : 开始 
    close : 结束 
    separator : 数组中元素之间的分隔符 -->
    <delete id="deleteMulti">
        DELETE FROM tb_user
        WHERE id IN
        <foreach collection="list" open="(" close=")" separator="," item="id">
            #{id}
        </foreach>
    </delete>



</mapper>
```

- mapper层的接口
 ```java
 package com.zgg.shop.web.admin.dao;

import com.zgg.shop.domian.TbUser;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by Z先生 on 2020/1/13.
 */
@Repository
public interface TbUserDao {
    void deleteMulti(List<String> ids);
}

 ```
 
 - 映射到数据库的sql执行语句
 ```txt
 DELETE FROM tb_user WHERE id IN ( ? , ? ) 
 ```
 