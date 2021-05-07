## 多模块打包

### 通用的子模块打包

在多模块项目中可能会有一个common的基础模块，这个模块一般是jar包且没有启动类，这个模块是被其他模块所依赖的，common模块的pom文件不需要加springboot的打包插件，否则会打包出不能被依赖的可执行jar



## web模块打包

web模块一般为一个单独的服务，这时需要加入springboot的打包插件，并且指定好启动类，否则会出现没有主属性清单错误

下面是一个web模块打包的build配置

```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>com.zgg.trade.ThirtyBootstrap</mainClass>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

```

