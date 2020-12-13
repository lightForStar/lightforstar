# Spring（笔记整理）

## Spring介绍

[官网简介](https://spring.io/projects/spring-framework)

```txt
The Spring Framework provides a comprehensive programming and configuration model for modern Java-based enterprise applications - on any kind of deployment platform.

A key element of Spring is infrastructural support at the application level: Spring focuses on the "plumbing" of enterprise applications so that teams can focus on application-level business logic, without unnecessary ties to specific deployment environments.
```

简单来说Spring是一个开源框架，使用Spring可以简化企业级应用开发，让我们专注于业务逻辑的实现，而不需要关注基础性的工作，例如日志、安全、事务等，复用性等。

## 使用Spring带来的好处

- 简单的整合主流框架，如Mybatis、Hibernate等
- 侵入程度低，只需要编写普通的POJO类加上Spring的注解或者配置文件即可
- 轻量级Ioc容器，帮我们管理对象之间的依赖关系，不需要手动创建对象
- 提供AOP(面向切面编程)功能，方便快捷的解决系统级业务，如日志、事务等
- 统一的事务管理



## Spring架构图

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blogtimg.jpg)

**core模块的依赖关系**

![Spring 体系结构](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blog1540290875453691.png)



Spring 由 20 多个模块组成，它们可以分为数据访问/集成（Data Access/Integration）、Web、面向切面编程（AOP, Aspects）、应用服务器设备管理（Instrumentation）、消息发送（Messaging）、核心容器（Core Container）和测试（Test）。

## Spring中的一些核心概念

**Bean**

被Spring管理的对象统称为Bean

**BeanDefinition**

BeanDefinition是用来描述一个Bean的也成为配置元数据，Spring会根据BeanDefinition来生成一个Bean。

![image-20200510123242750](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blogimage-20200510123242750.png)

## Spring 有几种配置方式

- 基于XML 的配置
- 基于注解的配置
- 基于Java 的配置

## Bean的作用域

1. singleton：这种bean 范围是默认的，这种范围确保不管接受到多少个请求，每个容器中只有一个
   bean 的实例，单例的模式由bean factory 自身来维护。

2. prototype：原形范围与单例范围相反，为每一个bean 请求提供一个实例。
3. request：在请求bean 范围内会每一个来自客户端的网络请求创建一个实例，在请求完成以后，
bean 会失效并被垃圾回收器回收。
4. Session：与请求范围类似，确保每个session 中有一个bean 的实例，在session 过期后，bean
会随之失效。
5. global- session：global-session 和Portlet 应用相关。当你的应用部署在Portlet 容器中工作
时，它包含很多portlet。如果你想要声明让所有的portlet 共用全局的存储变量的话，那么这全
局变量需要存储在global-session 中。
全局作用域与Servlet 中的session 作用域效果相同。

## 依赖注入的方式

- 基于构造函数

- 基于setter方法

- 基于注解

- 工厂方法注入

  1. 非静态工厂

     ```java
     public class CarFactory{
         public Car createHongQiCar(){
             Car car=new Car();
             car.setBrand("大众");
             return car;
         }
     }
     ```

     ```xml
     <bean id="carFactory" class="com.zgg.spring.study.bean.CarFactory"/>
     <bean id="car" factory-bean="carFactory"
          factory-method="createHongQiCar">
     </bean>
     ```

  2. 静态工厂

     ```java
     public class CarFactory{
         public static Car createCar(){
             Car car=new Car();
             car.setBrand("红旗CA72");
             return car;
         }
     }
     ```

     ```xml
     <bean id="car" class="com.zgg.spring.study.bean.CarFactory” factory-method="createCar"></bean>
     ```

## Spring的自动装配

（1）no：默认的方式是不进行自动装配的，通过手工设置ref属性来进行装配bean。

（2）byName：通过bean的名称进行自动装配，如果一个bean的 property 与另一bean 的name 相同，就进行自动装配。 

（3）byType：通过参数的数据类型进行自动装配。

（4）constructor：利用构造函数进行装配，并且构造函数的参数通过byType进行装配。

（5）autodetect：自动探测，如果有构造方法，通过 construct的方式自动装配，否则使用 byType的方式自动装配。

## @AutoWare的原理

在启动spring IoC时，容器自动装载了一个AutowiredAnnotationBeanPostProcessor后置处理器，当容器扫描到@Autowied、@Resource或@Inject时，就会在IoC容器自动查找需要的bean，并装配给该对象的属性。在使用@Autowired时，首先在容器中查询对应类型的bean。

​	如果查询结果刚好为一个，就将该bean装配给@Autowired指定的数据；

​	如果查询的结果不止一个，那么@Autowired会根据名称来查找；

​	如果上述查找的结果为空，那么会抛出异常。解决方法时，使用required=false。

注：@Autowired可用于：构造函数、成员变量、Setter方法

## @Autowired和@Resource之间的区别

- @Autowired默认是按照类型装配注入的，默认情况下它要求依赖对象必须存在（可以设置它required属性为false）。

- @Resource默认是按照名称来装配注入的，只有当找不到与名称匹配的bean才会按照类型来装配注入。

## Spring中Bean的生命周期

1. 扫描xml配置文件和标记了bean注解的类(@Componet,@Controller,@Service等等)

2. 根据配置元数据信息生成对应的BeanDefinition
3. 执行InstantiationAwareBeanPostProcessor的postProcessBeforeInstantiation
4. 实例化对象
5. 执行InstantiationAwareBeanPostProcessor的postProcessAfterInstantiation
6. 设置对象属性值
7. 执行Aware相关接口
8. 执行BeanPostProcessor前置处理方法
9. 执行InitializingBean的afterPropertiesSet方法
10. 存在自定义的init-methed则执行
11. 执行BeanPostProcessor后置处理方法
12. 执行DisposableBean的destroy方法
13. 存在自定义的destroy则执行

![image-20200510171611122](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blogimage-20200510171611122.png)

注：1. 其中Aware接口的执行顺序与xml中bean配置的顺序有关，暂时不明确原因

​		2. 当Aware和BeanPostProcessor（InstantiationAwareBeanPostProcessor）一起使用时BeanPostProcessor初始化方法会执行多次，暂时不明确原因

使用的spring版本

```xml
<!-- https://mvnrepository.com/artifact/org.springframework/spring-context -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>4.3.12.RELEASE</version>
</dependency>
```



这里提供一些测试案例

以下是实现扩展点接口的类

```java
public class MyAware implements BeanNameAware {
    public void setBeanName(String name) {
        System.out.println("BeanNameAware接口执行了 "+name);
    }
}
```

```java
public class MyBeanPostProcessor implements BeanPostProcessor {


    //初始化前调用
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessBeforeInitialization do ...  初始化前");
        return bean;
    }
    //初始化后调用
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessAfterInitialization do ...  初始化后");
        return bean;
    }
}
```

```java
public class MyInitializingBeanAndDisposableBean implements InitializingBean, DisposableBean {
    public void afterPropertiesSet() throws Exception {
        System.out.println("InitializingBean 的afterPropertiesSet方法执行了");
    }

    public void destroy() throws Exception {
        System.out.println("DisposableBean destroy 执行了");
    }
}
```

```java
public class MyInstantiationAwareBeanPostProcessor implements InstantiationAwareBeanPostProcessor {

    //实例化之前调用
    public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
        System.out.println(">>>postProcessBeforeInstantiation   实例化前");
        return null;
    }
    //实例化之后调用
    public boolean postProcessAfterInstantiation(Object bean, String beanName) throws BeansException {
        System.out.println(">>>postProcessAfterInstantiation  实例化后");
        return true;
    }

    public PropertyValues postProcessPropertyValues(PropertyValues pvs, PropertyDescriptor[] pds, Object bean, String beanName) throws BeansException {
        System.out.println("<**postProcessPropertyValues**>");

        return pvs;
    }
    //初始化前调用
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessBeforeInitialization do ...  初始化前");
        return bean;
    }
    //初始化后调用
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessAfterInitialization do ...  初始化后");
        return bean;
    }
}
```

测试使用的xml文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <bean id="myAware" class="com.zgg.spring.study.extend.point.MyAware" />
    <bean id="person" class="com.zgg.spring.study.bean.Person" init-method="myInit"  destroy-method="myDestroy">
        <property name="name" value="张三" />
    </bean>


<!--    <bean id="myInstantiationAwareBeanPostProcessor" class="com.zgg.spring.study.extend.point.MyInstantiationAwareBeanPostProcessor" />-->
    <bean id="myBeanPostProcessor" class="com.zgg.spring.study.extend.point.MyBeanPostProcessor" />
    <bean id="myInitializingBean" class="com.zgg.spring.study.extend.point.MyInitializingBeanAndDisposableBean" />

</beans>
```

```java
public class XmlApplicationTest {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext classPathXmlApplicationContext = new ClassPathXmlApplicationContext("classpath:application.xml");
        Person bean = classPathXmlApplicationContext.getBean(Person.class);
        System.out.println(bean);

        classPathXmlApplicationContext.close();

    }
}
```

通过改变xml中引入的扩展接口可以测试出InstantiationAwareBeanPostProcessor是在实例化前后调用的，BeanPostProcessor是在初始化前后调用的，并且xml配置的init-methed方法执行在InitializingBean之前，

xml配置的destroy-method执行在DisposableBean之后，整个的bean生命周期在上图中已经清晰的体现了。

## IoC的理解

​	Ioc(Inverse of Control:控制反转)是一种设计思想，把我们手动创建对象的权力交给IoC容器，由容器帮我们创建对象，我们需要用到时从容器中取即可，对象之间的依赖关系交由IoC容器管理，使用IoC容器可以简化我们的开发。IoC 容器是一个Map，里面存放各种对象，我们可以根据key(类型、名字)从中获取对象。

## DI

依赖注入是IoC的具体实现，根据对象的依赖关系直接注入所需要的对象。

## AOP(Aspect Oriented Programming)的理解

OOP是一种纵向编程的思想，由上而下的编程，但是对于一些系统级的处理就显得很冗余了，例如我们要在访问层加上日志，如果以OOP的思想编写，我们需要在访问层的每一个类都写上日志记录的语句，这种代码和我们的主业务逻辑无关，但是又需要做，这时候使用OOP编程就显得冗余了。而AOP正是为了解决这一类问题产生的，AOP是一种面向切面编程的思想，横向编程，AOP把影响多个类的系统级业务抽取成为一个切面，我们只需要处理这个切面即可，例如使用AOP之后我们日志不需要在访问层的每一个类中编写代码，我们只需要针对切面编写日志代码即可。使用AOP可以减少系统中的重复代码，降低了模块间的耦合度，同时提高了系统的可维护性。

## AOP实现的原理

AOP实现的关键在于 代理模式，AOP代理主要分为静态代理和动态代理。静态代理的代表为AspectJ；动态代理则以Spring AOP为代表。

### 静态代理

AspectJ是静态代理的增强，所谓静态代理，就是AOP框架会在编译阶段生成AOP代理类，因此也称为编译时增强，他会在编译阶段将AspectJ(切面)织入到Java字节码中，运行的时候就是增强之后的AOP对象。

### 动态代理

Spring AOP使用的动态代理，所谓的动态代理就是说AOP框架不会去修改字节码，而是每次运行时在内存中临时为方法生成一个AOP对象，这个AOP对象包含了目标对象的全部方法，并且在特定的切点做了增强处理，并回调原对象的方法。

### Spring AOP中的动态代理主要有两种方式，JDK动态代理和CGLIB动态代理

- JDK动态代理只提供接口的代理，不支持类的代理。核心InvocationHandler接口和Proxy类，InvocationHandler 通过invoke()方法反射来调用目标类中的代码，动态地将横切逻辑和业务编织在一起；接着，Proxy利用 InvocationHandler动态创建一个符合某一接口的的实例,  生成目标类的代理对象。

- 如果代理类没有实现 InvocationHandler 接口，那么Spring AOP会选择使用CGLIB来动态代理目标类。CGLIB（Code Generation Library），是一个代码生成的类库，可以在运行时动态的生成指定类的一个子类对象，并覆盖其中特定方法并添加增强代码，从而实现AOP。CGLIB是通过继承的方式做的动态代理，因此如果某个类被标记为final，那么它是无法使用CGLIB做动态代理的。

### 静态代理和动态代理的区别

静态代理与动态代理区别在于生成AOP代理对象的时机不同，相对来说AspectJ的静态代理方式具有更好的性能，但是AspectJ需要特定的编译器进行处理，而Spring AOP则无需特定的编译器处理。

### AOP中专业名词的解释

（1）切面（Aspect）：被抽取的公共模块，可能会横切多个对象。 在Spring AOP中，切面可以使用通用类（基于模式的风格） 或者在普通类中以 @AspectJ 注解来实现。

（2）连接点（Join point）：指方法，在Spring AOP中，一个连接点 总是 代表一个方法的执行。 

（3）通知（Advice）：在切面的某个特定的连接点（Join point）上执行的动作。通知有各种类型，其中包括“around”、“before”和“after”等通知。许多AOP框架，包括Spring，都是以拦截器做通知模型， 并维护一个以连接点为中心的拦截器链。

（4）切入点（Pointcut）：切入点是指 我们要对哪些Join point进行拦截的定义。通过切入点表达式，指定拦截的方法，比如指定拦截add*、search*。

（5）引入（Introduction）：（也被称为内部类型声明（inter-type declaration））。声明额外的方法或者某个类型的字段。Spring允许引入新的接口（以及一个对应的实现）到任何被代理的对象。例如，你可以使用一个引入来使bean实现 IsModified 接口，以便简化缓存机制。

（6）目标对象（Target Object）： 被一个或者多个切面（aspect）所通知（advise）的对象。也有人把它叫做 被通知（adviced） 对象。 既然Spring AOP是通过运行时代理实现的，这个对象永远是一个 被代理（proxied） 对象。

（7）织入（Weaving）：指把增强应用到目标对象来创建新的代理对象的过程。Spring是在运行时完成织入。

切入点（pointcut）和连接点（join point）匹配的概念是AOP的关键，这使得AOP不同于其它仅仅提供拦截功能的旧技术。 切入点使得定位通知（advice）可独立于OO层次。 例如，一个提供声明式事务管理的around通知可以被应用到一组横跨多个对象中的方法上（例如服务层的所有业务操作）。

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blog20180708154818891.png)

### 通知类型

（1）前置通知（Before advice）：在某连接点（join point）之前执行的通知，但这个通知不能阻止连接点前的执行（除非它抛出一个异常）。

（2）返回后通知（After returning advice）：在某连接点（join point）正常完成后执行的通知：例如，一个方法没有抛出任何异常，正常返回。 

（3）抛出异常后通知（After throwing advice）：在方法抛出异常退出时执行的通知。 

（4）后通知（After (finally) advice）：当某连接点退出的时候执行的通知（不论是正常返回还是异常退出）。 

（5）环绕通知（Around Advice）：包围一个连接点（join point）的通知，如方法调用。这是最强大的一种通知类型。 环绕通知可以在方法调用前后完成自定义的行为。它也会选择是否继续执行连接点或直接返回它们自己的返回值或抛出异常来结束执行。 环绕通知是最常用的一种通知类型。



## 事务

### Spring管理事务的两种方式

- 编程式事务管理 

  ​	使用原生的JDBC API进行事务管理

     [1]获取数据库连接Connection对象

     [2]取消事务的自动提交

     [3]执行操作

     [4]正常完成操作时手动提交事务

     [5]执行失败时回滚事务

     [6]关闭相关资源

- 声明式事务管理 ：声明式事务管理建立在AOP之上的。其本质是通过AOP功能，对方法前后进行拦截，将事务处理的功能编织到拦截的方法中，也就是在目标方法开始之前加入一个事务，在执行完目标方法之后根据执行情况提交或者回滚事务。

### 区别

​	在事务控制的细粒度上不同，编程式事务管理可以作用在代码块上，而声明式事务是通过@Transactional注解实现，只能作用在方法上

### 回滚时机

​	Spring默认抛出了未检查unchecked异常（继承自`RuntimeException`的异常）或者`Error`才回滚事务；其他异常不会触发回滚事务。如果在事务中抛出其他类型的异常，但却期望 Spring 能够回滚事务，就需要指定rollbackFor属性

@Transactional 注解设置遇到什么类型的异常回滚

[1]rollbackFor属性：指定遇到时必须进行回滚的异常类型，可以为多个

[2]noRollbackFor属性：指定遇到时不回滚的异常类型，可以为多个

![在这里插入图片描述](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blog20200327103101778.jpg)

### Spring的事务隔离级别

​	**这里和数据库支持的事务隔离级别一致，Spring的事务依赖于数据库**

- ISOLATION_DEFAULT：这是个 PlatfromTransactionManager 默认的隔离级别，使用数据库默认的事务隔离级别。

- ISOLATION_READ_UNCOMMITTED：读未提交，允许另外一个事务可以看到这个事务未提交的数据。

- ISOLATION_READ_COMMITTED：读已提交，保证一个事务修改的数据提交后才能被另一事务读取，而且能看到该事务对已有记录的更新。

- ISOLATION_REPEATABLE_READ：可重复读，保证一个事务修改的数据提交后才能被另一事务读取，但是不能看到该事务对已有记录的更新。

- ISOLATION_SERIALIZABLE：一个事务在执行的过程中完全看不到其他事务对数据库所做的更新。

### spring的事务传播行为

spring事务的传播行为说的是，当多个事务同时存在的时候，spring如何处理这些事务的行为。

- PROPAGATION_REQUIRED：如果当前没有事务，就创建一个新事务，如果当前存在事务，就加入该事务，该设置是最常用的设置。（**默认**）

- PROPAGATION_SUPPORTS：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就以非事务执行。‘

- PROPAGATION_MANDATORY：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常。

- PROPAGATION_REQUIRES_NEW：创建新事务，无论当前存不存在事务，都创建新事务。

- PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。

- PROPAGATION_NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。

- PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则按REQUIRED属性执行。
  

### 事务失效的几种情况

- 数据库引擎不支持事务，如使用了MyISAM引擎的数据表
- 编写的对象没有交由Spring管理

-  事务方法不是 public 的

  原因：TransactionInterceptor（事务拦截器）在目标方法执行前后进行拦截，DynamicAdvisedInterceptor（CglibAopProxy 的内部类）的 intercept 方法或 JdkDynamicAopProxy 的 invoke 方法会间接调用 AbstractFallbackTransactionAttributeSource的 computeTransactionAttribute 方法，获取Transactional 注解的事务配置信息。

  **此方法会检查目标方法的修饰符是否为 public，不是 public则不会获取@Transactional 的属性配置信息。**

- 事务方法是static、final

  原因：由于java继承时, 不能重写 private , final , static 修饰的方法.如果使用JDK动态代理则必须重写接口方法，重写时不能声明为 private , final , static

- 未开启@EnableTransactionManagement

- 方法内部捕捉了异常

- 事务的传播级别设置为非事务支持

- 同一个类中方法调用，导致@Transactional失效，无事务方法调用有事务方法

  ```java
      public void updateTest(){
          insertTest();
      }
  
      @Transactional
      public void insertTest(){
          User user = new User();
          user.setPassword("123");
          user.setUsername("testtt");
          user.setEmail("dsadadasd@qq.com");
          dao.insert(user);
          int i = 100/0;
      }
  ```

  注：两个方法都有事务则生效，其中一个事务失效相当于使用一个事务

  失效原因：由于使用Spring AOP代理造成的，因为只有当事务方法被当前类以外的代码调用时，才会由Spring生成的代理对象来管理。

## Spring容器的生命周期

Spring容器也是一个对象，Spring为我们提供了生命周期函数便于我们在容器初始化完成和销毁时进行一些操作。

### 有关生命周期的接口

接口关系

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/blog20190504154818842.png)

方法介绍

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20190504154849108.png)

## 使用案例

需配置到Spring容器中(xml或者注解)

```java
public class MySmartLifecycle  implements SmartLifecycle {
    private boolean isRunning = false;

    /**
     * 1. 我们主要在该方法中启动任务或者其他异步服务，比如开启MQ接收消息<br/>
     * 2. 当上下文被刷新（所有对象已被实例化和初始化之后）时，将调用该方法，默认生命周期处理器将检查每个SmartLifecycle对象的isAutoStartup()方法返回的布尔值。
     * 如果为“true”，则该方法会被调用，而不是等待显式调用自己的start()方法。
     */
    @Override
    public void start() {
        System.out.println("start");

        // 执行完其他业务后，可以修改 isRunning = true
        isRunning = true;
    }

    /**
     * 如果工程中有多个实现接口SmartLifecycle的类，则这些类的start的执行顺序按getPhase方法返回值从小到大执行。<br/>
     * 例如：1比2先执行，-1比0先执行。 stop方法的执行顺序则相反，getPhase返回值较大类的stop方法先被调用，小的后被调用。
     */
    @Override
    public int getPhase() {
        // 默认为0
        return 0;
    }

    /**
     * 根据该方法的返回值决定是否执行start方法。<br/>
     * 返回true时start方法会被自动执行，返回false则不会。
     */
    @Override
    public boolean isAutoStartup() {
        // 默认为false
        return true;
    }

    /**
     * 1. 只有该方法返回false时，start方法才会被执行。<br/>
     * 2. 只有该方法返回true时，stop(Runnable callback)或stop()方法才会被执行。
     */
    @Override
    public boolean isRunning() {
        // 默认返回false
        return isRunning;
    }

    /**
     * SmartLifecycle子类的才有的方法，当isRunning方法返回true时，该方法才会被调用。
     */
    @Override
    public void stop(Runnable callback) {
        System.out.println("stop(Runnable)");

        // 如果你让isRunning返回true，需要执行stop这个方法，那么就不要忘记调用callback.run()。
        // 否则在你程序退出时，Spring的DefaultLifecycleProcessor会认为你这个TestSmartLifecycle没有stop完成，程序会一直卡着结束不了，等待一定时间（默认超时时间30秒）后才会自动结束。
        // PS：如果你想修改这个默认超时时间，可以按下面思路做，当然下面代码是springmvc配置文件形式的参考，在SpringBoot中自然不是配置xml来完成，这里只是提供一种思路。
        // <bean id="lifecycleProcessor" class="org.springframework.context.support.DefaultLifecycleProcessor">
        //      <!-- timeout value in milliseconds -->
        //      <property name="timeoutPerShutdownPhase" value="10000"/>
        // </bean>
        callback.run();

        isRunning = false;
    }

    /**
     * 接口Lifecycle的子类的方法，只有非SmartLifecycle的子类才会执行该方法。<br/>
     * 1. 该方法只对直接实现接口Lifecycle的类才起作用，对实现SmartLifecycle接口的类无效。<br/>
     * 2. 方法stop()和方法stop(Runnable callback)的区别只在于，后者是SmartLifecycle子类的专属。
     */
    @Override
    public void stop() {
        System.out.println("stop");

        isRunning = false;
    }

}
```

### 总结

  我们可以通过实现SmartLifeCycle接口，实现其start() stop()方法来完成一些需要启动加载，关闭前执行的动作。

## IoC源码基本解析

## AOP源码解析



参考：

[https://www.funtl.com/zh/spring/Spring-%E4%BD%93%E7%B3%BB%E7%BB%93%E6%9E%84.html#%E6%9C%AC%E8%8A%82%E8%A7%86%E9%A2%91](https://www.funtl.com/zh/spring/Spring-体系结构.html#本节视频)

https://blog.csdn.net/a745233700/java/article/details/80959716

https://blog.csdn.net/andybbc/article/details/52913525

https://blog.csdn.net/hon_vin/article/details/105134342?utm_medium=distribute.pc_relevant.none-task-blog-baidujs-6

https://blog.csdn.net/qq_26323323/article/details/89814304?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.nonecase