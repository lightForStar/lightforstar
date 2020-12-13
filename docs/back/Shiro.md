# Shiro

## Shiro简介
Apache Shiro是一个强大且易用的Java安全框架,执行身份验证、授权、密码和会话管理。使用Shiro的易于理解的API,您可以快速、轻松地获得任何应用程序,从最小的移动应用程序到最大的网络和企业应用程序。
[官网](http://shiro.apache.org/)

## Shiro帮我们做了什么
Shiro是一个基于java的权限认证框架，最核心的便是权限管理，权限管理中，Shiro做了两件事情。第一个是认证，所谓认证就是判断该用户是否为使用者本人，也就是我们业务中的登录；第二件事是授权，用户访问我们系统时通常都会有限制，哪些功能是可以使用的，哪些功能是禁止用户使用的，这就是用户的权限，Shiro帮我们完成用户权限的鉴定。

## Shiro的核心组件
**三个核心组件：Subject, SecurityManager 和 Realms.**

- Subject

即“当前操作用户”。但是，在Shiro中，Subject这一概念并不仅仅指人，也可以是第三方进程、后台帐户（Daemon Account）或其他类似事物。它仅仅意味着“当前跟软件交互的东西”,相当于一个门面，所有的请求都从这里进入。

- SecurityManager

它是Shiro框架的核心，典型的Facade模式，Shiro通过SecurityManager来管理内部组件实例，并通过它来提供安全管理的各种服务。

- Realm

这是和我们业务强相关的组件，也是Shiro认证和授权的数据来源，Shiro想要进行认证和授权那么就必须知道正确的账号密码和这个用户已有的权限，而这些数据都是从Realm中获取

## Shiro架构
![image](https://s1.ax1x.com/2020/04/04/G0R71H.png)

## Shrio的认证流程
1. 构造Subject对象，传入认证参数token（UsernamePasswordToken），调用login方法
2. Subject对象将请求委托给SecurityManager，Subject对象讲请求委托给SecurityManager再分派到Authenticator 认证
3. Authenticator会根据你配置的Realm进行验证，判断token与数据源（通常是数据库）中的密码是否一致
4. 不一致则抛出AuthenticationException异常，我们捕获做登录失败处理

## Shrio的授权
Shiro中的授权我认为是一种权限控制，就和上面的认证一样，只不过对象从用户变成了权限，对权限进行认证，如果用户没有权限则拒绝访问

- 流程
1. Subject调用isPermitted或者/hasRole方法
2. 将请求委托给SecurityManager，Subject对象讲请求委托给SecurityManager再分派到Authorizer 授权
3. 通过Realm获取用户的角色/权限（涉及多种处理策略）
4. Authorizer会匹配当前请求是否有权限，无权限会抛出UnauthorizedException异常




## Shiro中绑定代码与用户权限的方式
方式一注解

在shiro中，我们一般使用注解的方式完成权限与代码的绑定，例如在方法上标注@RequiresRoles("admin")，表示拥有admin角色的用户才能访问该方法。对于用户权限的管理可以参考RBAC模型，基于角色的访问控制。

方式二编程
直接在代码中判断

```
Subject subject = SecurityUtils.getSubject();
if(subject.hasRole(“admin”)) {
    //有权限
} else {
    //无权限
}
```

## SpringBoot整合Shiro
### 引入依赖
```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-spring-boot-starter</artifactId>
    <version>1.5.2</version>
</dependency>
```

### 编写配置类
```java
package com.zgg.shiro.demo.demo.config.shiro;

import com.zgg.shiro.demo.demo.handler.ShiroUnauthorizeExceptionHandler;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class ShiroConfig {



    @Bean("securityManager")
    public DefaultWebSecurityManager securityManager() {
        System.out.println("securityManager1");
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        // 设置realm.绑定到securityManager中，实际上认证和授权都是这个类调度的
        securityManager.setRealm(myRealm());
        //工具类绑定securityManager，会从这个工具类获取Subject
        SecurityUtils.setSecurityManager(securityManager);
        return securityManager;
    }




    /**
     * ShiroFilter是整个Shiro的入口点，用于拦截需要安全控制的请求进行处理
     */
    @Bean("shiroFilter")
    public ShiroFilterFactoryBean shiroFilter() {
        System.out.println("shiroFilter");
        ShiroFilterFactoryBean shiroFilter = new ShiroFilterFactoryBean();
        shiroFilter.setSecurityManager(securityManager());
        shiroFilter.setUnauthorizedUrl("/no-permission");             //没有权限默认跳转的页面,这里不知道为什么没起作用
        Map<String, String> filterMap = new LinkedHashMap<>();
        filterMap.put("/**","anon");        //不需要认证            
//        filterMap.put("/admin/admin/login.action", "anon");
//        filterMap.put("/admin/admin/logout","logout");
//        filterMap.put("/css/**", "anon");
//        filterMap.put("/fonts/**", "anon");
//        filterMap.put("/images/**", "anon");
//        filterMap.put("/js/**", "anon");
//        filterMap.put("/lib/**", "anon");
        filterMap.put("/admin/**","authc"); //需要认证
        shiroFilter.setFilterChainDefinitionMap(filterMap);
        return shiroFilter;
    }

    /**
     * 自定义身份认证 realm;
     * <p>
     * 必须写这个类，并加上 @Bean 注解，目的是注入 CustomRealm，
     * 否则会影响 CustomRealm类 中其他类的依赖注入
     */
    @Bean
    public MyRealm myRealm() {
        return new MyRealm();
    }

    /**
     * 开启Shiro的注解
     */
    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(){
        AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor = new AuthorizationAttributeSourceAdvisor();
        authorizationAttributeSourceAdvisor.setSecurityManager(securityManager());
        return authorizationAttributeSourceAdvisor;
    }

    /**
     * 配置Shiro生命周期处理器
     */
    @Bean
    public LifecycleBeanPostProcessor lifecycleBeanPostProcessor(){
        return new LifecycleBeanPostProcessor();
    }

    @Bean
    public HandlerExceptionResolver solver(){
        System.out.println("HandlerExceptionResolver");
        return new ShiroUnauthorizeExceptionHandler();
    }


}

```

这里有几个坑的地方

-  SecurityUtils必须要绑定SecurityManager（注入默认实现时绑定了）
-  Shiro并没有提供认证和授权的业务，一定要自己实现（自定义Realm）
-  无权限跳转链接失效，需采用异常处理捕获，自定义HandlerExceptionResolver捕获UnauthorizedException

### 认证
```java
@ResponseBody
@RequestMapping("/login")
public String login(String username,String password) {
    System.out.println("开始登陆");
    Subject subject = SecurityUtils.getSubject();
    UsernamePasswordToken token = new UsernamePasswordToken(username, password);

    try {
        subject.login(token);
    }catch (AuthenticationException exception){
        System.out.println(token.getPassword());
        return "认证失败";
    }

    return "登录成功";

}
```
- 认证规则通过Realm里面的doGetAuthenticationInfo方法定义，这里为了方便验证，直接设置全部账号的密码都是123456
- 登录界面，输入任意账号，密码为123456都可以通过认证
![image](https://s1.ax1x.com/2020/04/05/G0X1Ag.png)

- 登录成功，认证成功
![image](https://s1.ax1x.com/2020/04/05/G0XNj0.png)
- 输入密码不为123456，认证失败
![image](https://s1.ax1x.com/2020/04/05/G0XDN4.png)
### 授权
授权通过Realm里面的doGetAuthorizationInfo方法定义，这里的授权会在你访问标注了权限注解（@RequiresRoles("admin")、 @RequiresPermissions("user_list")等）的接口时触发

```java
package com.zgg.shiro.demo.demo.config.shiro;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;

import java.util.HashSet;
import java.util.Set;


public class MyRealm extends AuthorizingRealm {
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {

        System.out.println("开始执行认证");

        //获取输入的账号,这个是前端传给我们的token
        String username = authenticationToken.getPrincipal().toString();

        //这里构造正确的身份信息，用于shiro比对前端传进来的用户。可以从数据库查询，这里定死了，credentials是密码
        SimpleAuthenticationInfo simpleAuthenticationInfo = new SimpleAuthenticationInfo(username,"123456","MyRealm");
        return simpleAuthenticationInfo;

    }

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        System.out.println("开始授权："+principalCollection.getPrimaryPrincipal().toString());
        //获取用户名,根据用户名查数据库，拿到该用户的角色信息,设置好role和permission
        String username =  principalCollection.getPrimaryPrincipal().toString();

        //这里设置的role对应检查@RequiresRoles注解标注的方法
        Set<String> roles = new HashSet<>();
        roles.add("admin");
        //这里设置的permission对应检查@RequiresPermissions注解标注的方法
        Set<String> perminssion =new HashSet<>();
        perminssion.add("user_look");
        //这里根据用户查询他所拥有的角色和权限。
        SimpleAuthorizationInfo simpleAuthorizationInfo = new SimpleAuthorizationInfo();

        simpleAuthorizationInfo.setStringPermissions(perminssion);

        simpleAuthorizationInfo.setRoles(roles);
        return simpleAuthorizationInfo;
    }
}
```

- 这里为了测试方便直接赋予通过认证者admin角色
- 提供一个接口进行测试
```
@ResponseBody
@RequiresRoles("admin")
@RequestMapping("/admin")
public String admin() {

    return "admin角色访问成功";

}
```
- 当我们没有认证通过，不具备权限时
![image](https://s1.ax1x.com/2020/04/05/G0Xz5Q.png)


- 当用户拥有admin角色时

![image](https://s1.ax1x.com/2020/04/05/G0jVVU.png)

[全部代码](https://github.com/lightForStar/demo)



## 不借助Shiro，我们怎么实现权限管理
Shiro是通过过滤链实现拦截请求，并在请求前进行认证和授权。如果我们不使用Shiro，我们也可以自定义拦截器或者过滤器实现权限拦截。

- 认证模块直接写在login业务方法中，并且在认证成功后将用户的权限保存至sesion中
- 在自定义的拦截器中判断用户是否有权限访问该接口（功能）
- 我们也可以通过自定义注解实现代码与权限的绑定（不需要手动维护url）


## 总结
权限管理不需要做的复杂时，可以自定义拦截器实现。

当我们的权限管理比较复杂时，借助Shiro可以更方便的管理，扩展性更强