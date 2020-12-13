## 需要的依赖
在pom文件中引入下面的依赖
```java
		<!-- Spring Boot log4j2依赖 start-->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-log4j2</artifactId>
		</dependency>
```

```txt
注意：springboot默认使用了logbak + slf4j的日志框架，所以需要排除掉

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
			<exclusions>
				<!-- 排除log4j日志读取-->
				<exclusion>
					<groupId>org.springframework.boot</groupId>
					<artifactId>spring-boot-starter-logging</artifactId>
				</exclusion>
			</exclusions>
		</dependency>

```

## 使用slf4j作为日志门面，log4j2作为日志的实现层

使用slf4j的好处：当我们需要换其他的日志系统时不需要更改其他的代码，直接换实现的日志即可

##  配置文件
```txt
这里使用springboot官方推荐的命名：log4j2-spring.xml
如果使用yml格式还需要单独引入解析log4j2解析yml配置文件的依赖，这里不贴出来了
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--设置log4j2的自身log级别为warn-->
<!--日志级别以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->
<!--Configuration后面的status，这个用于设置log4j2自身内部的信息输出，可以不设置，
    当设置成trace时，你会看到log4j2内部各种详细输出-->
<!--monitorInterval：Log4j能够自动检测修改配置 文件和重新配置本身，设置间隔秒数-->
<configuration status="warn" monitorInterval="30">

        <properties>
            <property name="log.level.console">info</property>
            <property name="log.path">/usr/family-logs</property>
            <property name="project.name">family</property>
            <property name="log.pattern">%d{yyyy-MM-dd HH:mm:ss.SSS} -%5p ${PID:-} [%15.15t] %-30.30C{1.} : %m%n</property>
        </properties>
    <!--先定义所有的appender-->
    <appenders>
        <!--这个输出控制台的配置-->
        <console name="Console" target="SYSTEM_OUT">
            <!--输出日志的格式-->
            <!--<PatternLayout pattern="[%d{HH:mm:ss:SSS}] [%p] - %l - %m%n"/>-->
            <PatternLayout pattern="${log.pattern}"/>
        </console>

        <!-- 这个会打印出所有的info及以下级别的信息，每次大小超过size，
        则这size大小的日志会自动存入按年份-月份建立的文件夹下面并进行压缩，作为存档-->
        <!--启动日志-->
        <RollingFile name="ROLLING_FILE" fileName="${log.path}/${project.name}.log"
                     filePattern="${log.path}/historyRunLog/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz">
            <Filters>
                <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
                <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
                <ThresholdFilter level="error" onMatch="DENY" onMismatch="NEUTRAL"/>
            </Filters>
            <PatternLayout pattern="${log.pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy modulate="true" interval="1"/>
            </Policies>
            <DefaultRolloverStrategy max="100"/>

        </RollingFile>


        <RollingFile name="PLATFORM_ROLLING_FILE" fileName="${log.path}/platform/${project.name}_platform.log"
                     filePattern="${log.path}/platform/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
                     >
            <ignoreExceptions>false</ignoreExceptions>
            <PatternLayout pattern="${log.pattern}"/>
            <!--配置以天为单位输出日志-->
            <Policies> 
                <TimeBasedTriggeringPolicy modulate="true" interval="1"/>
            </Policies>
            <DefaultRolloverStrategy max="100"/>

        </RollingFile>

        <RollingFile name="REFUND_ROLLING_FILE" fileName="${log.path}/refund/${project.name}_refund.log"
                     filePattern="${log.path}/refund/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        >
            <Filters>
                <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
                <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
                <ThresholdFilter level="error" onMatch="DENY" onMismatch="NEUTRAL"/>
            </Filters>
            <PatternLayout pattern="${log.pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy modulate="true" interval="1"/>
            </Policies>
            <DefaultRolloverStrategy max="100"/>

        </RollingFile>


        <RollingFile name="CHARGE_ROLLING_FILE" fileName="${log.path}/charge/${project.name}_charge.log"
                     filePattern="${log.path}/charge/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        >
            <ignoreExceptions>false</ignoreExceptions>
            <PatternLayout pattern="${log.pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy modulate="true" interval="1"/>
            </Policies>
            <DefaultRolloverStrategy max="100"/>

        </RollingFile>

        <RollingFile name="EXCEPTION_ROLLING_FILE" fileName="${log.path}/exception/${project.name}_exception.log"
                     filePattern="${log.path}/exception/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz">
            <PatternLayout pattern="${log.pattern}"/>
            <Policies>
                <TimeBasedTriggeringPolicy modulate="true" interval="1"/>
            </Policies>
            <DefaultRolloverStrategy max="100"/>

        </RollingFile>
    </appenders>
    <!--然后定义logger，只有定义了logger并引入的appender，appender才会生效-->
    <loggers>
        <!--过滤掉spring和hibernate的一些无用的debug信息-->
        <logger name="org.springframework" level="INFO">
        </logger>
        <logger name="org.mybatis" level="INFO">
        </logger>
        <!--additivity是否追加到父级日志中-->
        <logger name="refund" level="debug" additivity="false">
            <appender-ref ref="REFUND_ROLLING_FILE"/>
        </logger>

        <logger name="platform" level="debug" additivity="false">
            <appender-ref ref="PLATFORM_ROLLING_FILE"/>
        </logger>

        <root level="info">
            <appender-ref ref="Console"/>
            <appender-ref ref="ROLLING_FILE"/>
            <appender-ref ref="EXCEPTION_ROLLING_FILE"/>
        </root>
    </loggers>
</configuration>
```
**yml格式**

```yaml
# 共有8个级别，按照从低到高为：ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < OFF。
Configuration:
  status: warn
  monitorInterval: 30
  Properties: # 定义全局变量
    Property: # 缺省配置（用于开发环境）。其他环境需要在VM参数中指定，如下：
      #测试：-Dlog.level.console=warn -Dlog.level.xjj=trace
      #生产：-Dlog.level.console=warn -Dlog.level.xjj=info
      - name: log.level.console
        value: info
      - name: log.path
        value: /usr/express1-logs
      - name: project.name
        value: express
      - name: log.pattern
        value: "%d{yyyy-MM-dd HH:mm:ss.SSS} -%5p ${PID:-} [%15.15t] %-30.30C{1.} : %m%n"
  Appenders:
    Console:  #输出到控制台
      name: CONSOLE
      target: SYSTEM_OUT
      PatternLayout:
        pattern: ${log.pattern}
#   启动日志
    RollingFile:
      - name: ROLLING_FILE
        fileName: ${log.path}/${project.name}.log
        filePattern: "${log.path}/historyRunLog/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        PatternLayout:
          pattern: ${log.pattern}
        Filters:
#        一定要先去除不接受的日志级别，然后获取需要接受的日志级别
          ThresholdFilter:
            - level: error
              onMatch: DENY
              onMismatch: NEUTRAL
            - level: info
              onMatch: ACCEPT
              onMismatch: DENY
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 100
#   平台日志
      - name: PLATFORM_ROLLING_FILE
        ignoreExceptions: false
        fileName: ${log.path}/platform/${project.name}_platform.log
        filePattern: "${log.path}/platform/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        PatternLayout:
          pattern: ${log.pattern}
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 100
#   业务日志
      - name: BUSSINESS_ROLLING_FILE
        ignoreExceptions: false
        fileName: ${log.path}/bussiness/${project.name}_bussiness.log
        filePattern: "${log.path}/bussiness/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        PatternLayout:
          pattern: ${log.pattern}
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 100
#   错误日志
      - name: EXCEPTION_ROLLING_FILE
        ignoreExceptions: false
        fileName: ${log.path}/exception/${project.name}_exception.log
        filePattern: "${log.path}/exception/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        ThresholdFilter:
          level: error
          onMatch: ACCEPT
          onMismatch: DENY
        PatternLayout:
          pattern: ${log.pattern}
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 100
#   DB 日志
      - name: DB_ROLLING_FILE
        ignoreExceptions: false
        fileName: ${log.path}/db/${project.name}_db.log
        filePattern: "${log.path}/db/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        PatternLayout:
          pattern: ${log.pattern}
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 100
  #   CHARGE日志
      - name: CHARGE_ROLLING_FILE
        ignoreExceptions: false
        fileName: ${log.path}/charge/${project.name}_charge.log
        filePattern: "${log.path}/charge/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        PatternLayout:
          pattern: ${log.pattern}
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 365
  #   REFUND日志
      - name: REFUND_ROLLING_FILE
        ignoreExceptions: false
        fileName: ${log.path}/refund/${project.name}_refund.log
        filePattern: "${log.path}/refund/$${date:yyyy-MM}/${project.name}-%d{yyyy-MM-dd}-%i.log.gz"
        PatternLayout:
          pattern: ${log.pattern}
        Policies:
          TimeBasedTriggeringPolicy:  # 按天分类
            modulate: true
            interval: 1
        DefaultRolloverStrategy:     # 文件最多100个
          max: 365
  Loggers:
    Root:
      level: info
      AppenderRef:
        - ref: CONSOLE
        - ref: ROLLING_FILE
        - ref: EXCEPTION_ROLLING_FILE
    Logger:
      - name: platform
        level: info
        additivity: false
        AppenderRef:
          - ref: CONSOLE
          - ref: PLATFORM_ROLLING_FILE
      - name: bussiness
        level: info
        additivity: false
        AppenderRef:
          - ref: BUSSINESS_ROLLING_FILE
      - name: exception
        level: debug
        additivity: true
        AppenderRef:
          - ref: EXCEPTION_ROLLING_FILE
      - name: db
        level: info
        additivity: false
        AppenderRef:
          - ref: DB_ROLLING_FILE
      - name: charge
        level: info
        additivity: true
        AppenderRef:
          - ref: CHARGE_ROLLING_FILE
      - name: refund
        level: info
        additivity: false
        AppenderRef:
          - ref: REFUND_ROLLING_FILE
#    监听具体包下面的日志
#    Logger: # 为com.xjj包配置特殊的Log级别，方便调试
#      - name: com.xjj
#        additivity: false
#        level: ${sys:log.level.xjj}
#        AppenderRef:
#          - ref: CONSOLE
#          - ref: ROLLING_FILE
```
## 实例
### 使用slf4j + log4j2输出日志
```java
package com.tuorong;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Z先生 on 2019/9/1.
 */
public class Slf4j_Log4j2_Test extends ExpressApplicationTests{
    @Test
   public void testLogger(){
        //直接输出
        Logger loggerByGetClass = LoggerFactory.getLogger(this.getClass());
        loggerByGetClass.info("class: info");
        //输出到文件，name对应自定义的logger
        Logger platform = LoggerFactory.getLogger("platform");
        Logger refund = LoggerFactory.getLogger("refund");
        refund.info("测试refund");
        platform.info("测试platform45");

   }
}
   
   自定义文件输出配置：
        <logger name="platform" level="debug" additivity="false">
            <appender-ref ref="PLATFORM_ROLLING_FILE"/>
        </logger>
 ```
 
 ### 单独使用使用log4j2输出日志
 
 ```java
 package com.tuorong;

import org.apache.logging.log4j.LogManager;
import org.junit.Test;

/**
 * 单独使用log4j2输出日志
 * Created by Z先生 on 2019/9/4.
 */
public class Log4j2Test extends ExpressApplicationTests{
    @Test
    public void log4j2SingleTest(){
         org.apache.logging.log4j.Logger logger = LogManager.getLogger(this.getClass());
         logger.info("测试输出info");
    }
}
 
 ```
 
 **注意：如果单独使用单元测试要继承项目Test类**
 
 slf4j与log4j、log4j2的关系参见：https://blog.csdn.net/HarderXin/article/details/80422903