# 概述
### 是什么？
Spring Cloud Ribbon 是基于 Netflix Ribbon 实现的一套**客户端**负载均衡的工具。
简单的说，Ribbonn是Netflix的开源项目，主要功能 是提供**客户端的软件负载均衡算法和服务调用**。Ribbon客户端组件提供一系列完善的配置项，如连接超时，重试等。就是在配置文件中列出 Loa Balancer后面所有机器，Ribbon会自动帮助你基于某种规则 (如简单轮询，随机连接等)去连接这些机器。我们很容易使用Ribbon实现自定义的负载均衡算法。

### 官网资料，停更
https://github.com/Netflix/ribbon
### 能干什么？
1. 负载均衡
    * 负载均衡(Load Balance)是什么
        将用户的请求平摊的分配到多个服务上，从而达到HA(高可用)，常见的负载均衡有 Nginx,LVS,硬件 F5等。
    * Ribbon 本地负载均衡客户端 VS Nginx 服务端负载均衡
        Nginx 是服务器 负载均衡，客户端所有请求都会交给 nginx，然后由 nginx实现请求转发。即负载均衡是由服务端实现的。
        Ribbon 是本地负载均衡，在微服务调用接口时，在注册中心上获取注册信息服务列表 之后缓存在JVM本地，从而实现本地RPC远程服务调用技术。
2. 实现
负载均衡+RestTemplate 调用

<img src="https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/Ribbon.png">

* Ribbon工作时有两步
    1. 第一步先选择 EurekaServer，优先选择统一区域负载较少的 server
    2. 第二部再根据用户指定的策略，从server取到的服务注册列表中选择一个地址。其中 Riibon 提供了多种策略（轮询，随机，根据响应时间加权）。

### 引入依赖
不需要
spring-cloud-starter-netflix-eureka-client 已经引入了 Ribbon-Balance的依赖

# RestTemplate 使用
1. getForObject 返回json
2. getForEntity 返回ResponseEnity对象，包括响应头，响应体等信息。
3. postForObject
与 get 方法一样，不同的是传进去的参数是对象
4. postForEntity
5. GET 请求方法
6. POST请求方法

# Ribbon 自带的负载均衡
### 核心组件 IRule
###### IRule默认自带的负载规则
1. RoundRobinRule   轮询
2. RandomRule   随机
3. RetryRule    先按照RoundRobinRule的 策略获取服务，如果获取服务失败则在指定时间里进行重试，获取可用服务
4. WeightedResponseTimeRule 对RoundRobinRule的扩展，响应速度越快，实例选择权重越大 ，越容易被选择
5. BestAvailableRule    会先过滤掉由于多次访问故障而处于断路器 跳闸状态的服务，然后选择一个并发一个最小的服务
6. BestAvaibilityFilteringRule  先过滤掉故障实例，再选择并发量较小的实例
7. ZoneAvoidanceRule    默认规则，符合server所在区域的性能和server的可用性选择服务器
###### 如何替换
1. 注意：IRule配置类不能放在@ComponentSan 的包及子包下，因为默认的扫描会变成全局负载均衡都按照这样的规则。
2. 新建包 com.zgg.myRule
3. 新建类 
    ```java
    public class MySelfRule {
        @Bean
        public IRule myRule(){
            return new RandomRule();//定义为随机
        }
    }
    ```
4. 主类添加注解
```java
// 选择要接收的服务和配置类
@RibbonClient(name = "CLOUD-PAYMENT-SERVICE",configuration = MySelfRule.class)
```
### 默认负载均衡轮回算法原理
#### 负载均衡算法
rest 接口 第几次请求数 % 服务器集群=实际调用服务器位置下标，每次服务重启后rest接口计数从1开始

总台数：2台

请求数  调用下标
1       1%2=1       
2       2%2=0
3       3%2=1
4       4%2=0

####  RoundRobinRule源码分析

- 继承关系图

![image-20200704154500672](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20200704154500672.png)

- IRule的源码

  ```java
  /**
   * Interface that defines a "Rule" for a LoadBalancer. A Rule can be thought of
   * as a Strategy for loadbalacing. Well known loadbalancing strategies include
   * Round Robin, Response Time based etc.
   * 
   * @author stonse
   * 
   */
  public interface IRule{
      /*
       * choose one alive server from lb.allServers or
       * lb.upServers according to key
       * 
       * @return choosen Server object. NULL is returned if none
       *  server is available 
       */
  
      public Server choose(Object key);
      
      public void setLoadBalancer(ILoadBalancer lb);
      
      public ILoadBalancer getLoadBalancer();    
  }
  ```

  我们可以看到IRule接口里面有choose方法，choose方法便是选择哪一个服务实例的方法

  

- debug流程分析

  1. 配置好负载均衡后（使用默认策略轮询），我们使用消费者调用服务提供方这里有两个服务，端口分别是8001和8002

  ```java
  @GetMapping("/consumer/payment/get/{id}")
  public CommonResult<Payment> getPayment(@PathVariable("id") Long id)
  {
      return restTemplate.getForObject(PAYMENT_URL+"/payment/get/"+id,CommonResult.class);
  }
  ```

  2. 一步步debug，下面附上流程调用图

     ![image-20200704165037569](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20200704165037569.png)

  3. 我们发现经过org.springframework.cloud.netflix.ribbon.RibbonLoadBalancerClient#execute(java.lang.String, org.springframework.cloud.client.loadbalancer.LoadBalancerRequest<T>, java.lang.Object)这个方法后server里面的url就已经确定好了，这个方法在步骤2中调用栈的最上方

  ```java
  /**
  	 * New: Execute a request by selecting server using a 'key'. The hint will have to be
  	 * the last parameter to not mess with the `execute(serviceId, ServiceInstance,
  	 * request)` method. This somewhat breaks the fluent coding style when using a lambda
  	 * to define the LoadBalancerRequest.
  	 * @param <T> returned request execution result type
  	 * @param serviceId id of the service to execute the request to
  	 * @param request to be executed
  	 * @param hint used to choose appropriate {@link Server} instance
  	 * @return request execution result
  	 * @throws IOException executing the request may result in an {@link IOException}
  	 */
  public <T> T execute(String serviceId, LoadBalancerRequest<T> request, Object hint)
      throws IOException {
      ILoadBalancer loadBalancer = getLoadBalancer(serviceId);
      Server server = getServer(loadBalancer, hint);
      if (server == null) {
          throw new IllegalStateException("No instances available for " + serviceId);
      }
      RibbonServer ribbonServer = new RibbonServer(serviceId, server,
                                                   isSecure(server, serviceId),
                                                   serverIntrospector(serviceId).getMetadata(server));
  
      return execute(serviceId, ribbonServer, request);
  }
  ```

  ​	接下来让我们继续往下执行，来到了这个方法org.springframework.cloud.netflix.ribbon.RibbonLoadBalancerClient#getServer(com.netflix.loadbalancer.ILoadBalancer, java.lang.Object)

  ```java
  protected Server getServer(ILoadBalancer loadBalancer, Object hint) {
      if (loadBalancer == null) {
          return null;
      }
      // Use 'default' on a null hint, or just pass it on?
      return loadBalancer.chooseServer(hint != null ? hint : "default");
  }
  ```

  ​	hint传入的是null，接下来执行到了com.netflix.loadbalancer.ZoneAwareLoadBalancer#chooseServer

  ```java
  @Override
  public Server chooseServer(Object key) {
      if (!ENABLED.get() || getLoadBalancerStats().getAvailableZones().size() <= 1) {
          logger.debug("Zone aware logic disabled or there is only one zone");
          return super.chooseServer(key);
      }
      Server server = null;
      try {
          LoadBalancerStats lbStats = getLoadBalancerStats();
          Map<String, ZoneSnapshot> zoneSnapshot = ZoneAvoidanceRule.createSnapshot(lbStats);
          logger.debug("Zone snapshots: {}", zoneSnapshot);
          if (triggeringLoad == null) {
              triggeringLoad = DynamicPropertyFactory.getInstance().getDoubleProperty(
                  "ZoneAwareNIWSDiscoveryLoadBalancer." + this.getName() + ".triggeringLoadPerServerThreshold", 0.2d);
          }
  
          if (triggeringBlackoutPercentage == null) {
              triggeringBlackoutPercentage = DynamicPropertyFactory.getInstance().getDoubleProperty(
                  "ZoneAwareNIWSDiscoveryLoadBalancer." + this.getName() + ".avoidZoneWithBlackoutPercetage", 0.99999d);
          }
          Set<String> availableZones = ZoneAvoidanceRule.getAvailableZones(zoneSnapshot, triggeringLoad.get(), triggeringBlackoutPercentage.get());
          logger.debug("Available zones: {}", availableZones);
          if (availableZones != null &&  availableZones.size() < zoneSnapshot.keySet().size()) {
              String zone = ZoneAvoidanceRule.randomChooseZone(zoneSnapshot, availableZones);
              logger.debug("Zone chosen: {}", zone);
              if (zone != null) {
                  BaseLoadBalancer zoneLoadBalancer = getLoadBalancer(zone);
                  server = zoneLoadBalancer.chooseServer(key);
              }
          }
      } catch (Exception e) {
          logger.error("Error choosing server using zone aware logic for load balancer={}", name, e);
      }
      if (server != null) {
          return server;
      } else {
          logger.debug("Zone avoidance logic is not invoked.");
          return super.chooseServer(key);
      }
  }
  ```

  ​	我们发现在第一个if里面就返回了，执行父类的chooseServer方法，并且key为default，接下来执行com.netflix.loadbalancer.BaseLoadBalancer#chooseServer方法

  ```java
  /*
       * Get the alive server dedicated to key
       * 
       * @return the dedicated server
       */
  public Server chooseServer(Object key) {
      if (counter == null) {
          counter = createCounter();
      }
      counter.increment();
      if (rule == null) {
          return null;
      } else {
          try {
              return rule.choose(key);
          } catch (Exception e) {
              logger.warn("LoadBalancer [{}]:  Error choosing server for key {}", name, key, e);
              return null;
          }
      }
  }
  ```

  方法里面的rule便是IRule的实现类RoundRobinRule，采用轮询的策略，往下执行到try语句块中返回，继续下一步

  ```java
  /**
           * Get a server by calling {@link AbstractServerPredicate#chooseRandomlyAfterFiltering(java.util.List, Object)}.
           * The performance for this method is O(n) where n is number of servers to be filtered.
           */
  @Override
  public Server choose(Object key) {
      ILoadBalancer lb = getLoadBalancer();
      Optional<Server> server = getPredicate().chooseRoundRobinAfterFiltering(lb.getAllServers(), key);
      if (server.isPresent()) {
          return server.get();
      } else {
          return null;
      }       
  }
  ```

  此方法的作用便是根据所有服务名相同的实例选择出下一个要调用的实例，接下来就是关键的方法了，我们继续看这个方法com.netflix.loadbalancer.AbstractServerPredicate#chooseRoundRobinAfterFiltering(java.util.List<com.netflix.loadbalancer.Server>, java.lang.Object)

  ```java
  /**
       * Choose a server in a round robin fashion after the predicate filters a given list of servers and load balancer key. 
       */
  public Optional<Server> chooseRoundRobinAfterFiltering(List<Server> servers, Object loadBalancerKey) {
      List<Server> eligible = getEligibleServers(servers, loadBalancerKey);
      if (eligible.size() == 0) {
          return Optional.absent();
      }
      return Optional.of(eligible.get(incrementAndGetModulo(eligible.size())));
  }
  ```

  在这个方法里面我们先获取到所有实例，然后根据上面所说的计数器，每执行请求请求数加一，对服务实例数量求余得到下一个实例，具体实现看这个方法eligible.get(incrementAndGetModulo(eligible.size()))，根据下一个index获取实例（incrementAndGetModulo(eligible.size())	），我们详细看这个方法

  ```java
  
  /**
       * Referenced from RoundRobinRule
       * Inspired by the implementation of {@link AtomicInteger#incrementAndGet()}.
       *
       * @param modulo The modulo to bound the value of the counter.
       * @return The next value.
       */
  private int incrementAndGetModulo(int modulo) {
      for (;;) {
          int current = nextIndex.get();
          int next = (current + 1) % modulo;
          if (nextIndex.compareAndSet(current, next) && current < modulo)
              return current;
      }
  }
  ```

  这里通过自旋、CAS和JUC下的AtomicInteger类增加下一次请求数量并且得到下一个请求实例的下标，如果CAS更新成功则返回下一个实例发下标

  完整的debug流程图

  ![image-20200704172000079](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20200704172000079.png)

  ##### 流程总结

  1. 根据请求的服务名找到所有的实例
  2. 根据自旋、CAS和JUC下的AtomicInteger得到请求的总数（不重启则一直维护）
  3. 请求总数量对实例总数量进行取余得到第几个实例
  4. 根据实例进行请求

  



#### 手写轮回算法
思路：

根据调用的服务名获取到所有已注册的实例，初始化请求计数器，利用请求计数器对服务数量求余得到服务实例，完成服务调用

难点：计数器的自增考虑并发，使用CAS + 自旋锁完成自增



1. 定义获取服务实例的接口

   ```java
   /**
    * 自己实现负载均衡
    */
   public interface MyLoadBalance {
       /**
        * 根据全部服务实例获取下一个服务
        * @param serviceInstances
        * @return
        */
       ServiceInstance getInstance(List<ServiceInstance> serviceInstances);
   }
   ```

2. 利用使用CAS + 自旋锁完成请求计数器自增并且利用请求计数器%服务总数得到下一个服务

   ```java
   /**
    * @author : Z先生
    * @date : 2020-07-04 17:45
    **/
   @Component
   public class MyBalanceImpl implements MyLoadBalance {
       //服务请求的次数
       private AtomicInteger requestCount = new AtomicInteger(0);
   
       @Override
       public  ServiceInstance getInstance(List<ServiceInstance> serviceInstances) {
           if (serviceInstances == null || serviceInstances.isEmpty()) {
               return null;
           }
           int instanceIndex = getAndIncrement() % serviceInstances.size();
   
           return serviceInstances.get(instanceIndex);
       }
   
       /**
        * 使用自旋增加请求数量
        * @return
        */
       public final int getAndIncrement(){
           int next;
           int current;
           do {
               current = requestCount.get();
               next = current>=Integer.MAX_VALUE ? 0 : current + 1;
           }while (!requestCount.compareAndSet(current,next));
           System.out.println("next *** "+next);
           return next;
       }
   }
   ```

   

3. 测试

   消费方

   ```java
   **
    * @author : Z先生
    * @date : 2020-06-24 19:56
    **/
   @RestController
   public class OrderController {
   
       @Resource
       private RestTemplate restTemplate;
   
       @Resource
       private DiscoveryClient discoveryClient;
   
       @Resource
       private MyLoadBalance myLoadBalance;
   
   
       @GetMapping("/consumer/my/load/balance")
       public String testMyLoadBalance(){
           List<ServiceInstance> instances = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
           ServiceInstance instance = myLoadBalance.getInstance(instances);
           URI uri = instance.getUri();
           System.out.println("url --- "+uri);
           return restTemplate.getForObject(uri + "/payment/lb",String.class);
       }
   
   }
   ```

   服务提供方，定义两个微服务端口分别是8001和8002

   ```java
   @RestController
   @Slf4j
   public class PaymentController {
       @Value("${server.port}")
       private String serverPort;
   
       @GetMapping(value = "/payment/lb")
       public String getPaymentLB()
       {
           return serverPort;
       }
   }
   ```

   注意

   - 注入的RestTemplate不能开启@LoadBalanced注解，否则会使用RestTemplate自带的负载均衡功能

   

   