# Redis理论篇

## 什么是Redis

Redis 是 C 语言开发的一个开源的、高性能的内存数据库，可以用作数据库、缓存、消息中间件等。它是一种 NoSQL（not-only sql，泛指非关系型数据库）的数据库（简述）。Redis 作为一个内存数据库：（优点）

- 性能优秀，数据在内存中，读写速度非常快。
- 单进程单线程，是线程安全的，采用 IO 多路复用机制。
- 丰富的数据类型，支持字符串（strings）、散列（hashes）、列表（lists）、集合（sets）、有序集合（sorted sets）等。
- 支持数据持久化。可以将内存中数据保存在磁盘中，重启时加载。
- 可以用作分布式锁。
- 可以作为消息中间件使用，支持发布订阅。



## Redis的数据类型

### Redis中如何描述数据类型

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/640)

Redis中使用redisObject 描述所有的数据类型，redisObject 最主要的信息如上图所示：type 表示一个 value 对象具体是何种数据类型，encoding 是不同数据类型在 Redis 内部的存储方式。比如：type=string 表示 value 存储的是一个普通字符串，那么 encoding 可以是 raw 或者 int。

### Redis中5种类型的编码

![image-20201009104357476](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20201009104357476.png)

### string

**介绍：**string 是 redis 最基本的类型，一个 key 对应一个 value。value 不仅是 string，也可以是数字。string 类型是二进制安全的，意思是 redis 的 string 类型可以包含任何数据，比如 jpg 图片或者序列化的对象。string 类型的值最大能存储 512M。

**常用命令:** set,get,decr,incr,mget 等。

**应用场景** ：常规 key-value 缓存应用；常规计数：微博数，粉丝数等。

### hash

**介绍** ：Hash 是一个键值（key-value）的集合。redis 的 hash 是一个 string 的 key 和 value 的映射表，Hash 特别适合存储对象。

**常用命令** ：hget,hset,hgetall 等。

**应用场景** ：hash 特别适合用于存储对象，后续操作的时候，你可以直接仅仅修改这个对象中的某个字段的值。比如我们可以 hash 数据结构来存储用户信息，商品信息等等。

### list

**介绍** ：list 列表是简单的字符串列表，按照插入顺序排序。可以添加一个元素到列表的头部（左边）或者尾部（右边） ：

**常用命令：**lpush、rpush、lpop、rpop、lrange(获取列表片段)等。

**应用场景** ：list 应用场景非常多，也是 Redis 最重要的数据结构之一，比如 twitter 的关注列表，粉丝列表都可以用 list 结构来实现。

### set

**介绍** ：set 是 string 类型的无序集合。集合是通过 hashtable 实现的。set 中的元素是没有顺序的，而且是没有重复的。

**常用命令：** sdd、spop、smembers、sunion 等。

**应用场景** ：redis set 对外提供的功能和 list 一样是一个列表，特殊之处在于 set 是自动去重的，而且 set 提供了判断某个成员是否在一个 set 集合中。

### zset

**介绍** ：zset 和 set 一样是 string 类型元素的集合，且不允许重复的元素。

**常用命令：** zadd、zrange、zrem、zcard 等。

**使用场景：**sorted set 可以通过用户额外提供一个优先级（score）的参数来为成员排序，并且是插入有序的，即自动排序。当你需要一个有序的并且不重复的集合列表，那么可以选择 sorted set 结构。和 set 相比，sorted set 关联了一个 double 类型权重的参数 score，使得集合中的元素能够按照 score 进行有序排列，redis 正是通过分数来为集合中的成员进行从小到大的排序。

**Redis 数据类型应用场景总结:**

![image-20201009135608898](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20201009135608898.png)

## Redis中的缓存一致性问题

分布式环境下非常容易出现缓存和数据库间数据一致性问题，针对这一点，如果项目对缓存的要求是**强一致性**的，那么就**不要使用缓存**。我们只能采取合适的策略来降低缓存和数据库间数据不一致的概率，而无法保证两者间的强一致性。合适的策略包括合适的缓存更新策略，**更新数据库后及时更新缓存、缓存失败时增加重试机制。**

## Redis 缓存雪崩

同一时间内缓存大面积失效，导致请求都落在数据库，数据库会被打崩。

解决方案：

1、在批量往 Redis 存数据的时候，把每个 Key 的失效时间都加个随机值就好了，这样可以保证数据不会再同一时间大面积失效。

2、设置热点数据永不过期

## Redis 缓存穿透

缓存穿透是指缓存和数据库中都没有的数据，而用户（黑客）不断发起请求，举个栗子：我们数据库的 id 都是从 1 自增的，如果发起 id=-1 的数据或者 id 特别大不存在的数据，这样的不断攻击导致数据库压力很大，严重会击垮数据库。

解决方案：

1、在接口层增加校验，比如用户鉴权，参数做校验，不合法的校验直接 return，比如 id 做基础校验，id<=0 直接拦截。

2、使用布隆过滤器，布隆过滤器是一个非常大的位数组，使用多个hash函数对存入的key进行哈希操作映射到多个位置，如果该key不存在那么映射后的数组位置的值为初始值，否则为特定值，有一定的误判率，不同的key可能会哈希到同样的位置导致某个元素不存在但是误判为存在。

## Redis缓存击穿

缓存击穿是指一个 Key 非常热点，在不停地扛着大量的请求，大并发集中对这一个点进行访问，当这个 Key 在失效的瞬间，持续的大并发直接落到了数据库上，就在这个 Key 的点上击穿了缓存。

解决方案：

1、设置热点数据永不过期

2、加上互斥锁

## Redis为什么是单线程的

因为 Redis 完全是基于内存的操作，CPU 不是 Redis 的瓶颈，Redis 的瓶颈最有可能是机器内存的大小或者网络带宽。既然单线程容易实现，而且 CPU 不会成为瓶颈，那就顺理成章的采用单线程的方案了

## Redis 是单线程的，为什么还能这么快

- Redis 完全基于内存，绝大部分请求是纯粹的内存操作，非常迅速，数据存在内存中，类似于 HashMap，HashMap 的优势就是查找和操作的时间复杂度是 O(1)。
- 数据结构简单，对数据操作也简单。
- 采用单线程，避免了不必要的上下文切换和竞争条件，不存在多线程导致的 CPU 切换，不用去考虑各种锁的问题，不存在加锁释放锁操作，没有死锁问题导致的性能消耗。
- 使用多路复用 IO 模型，非阻塞 IO。



## Redis 和 Memcached 的区别

1. **存储方式上** ：memcache 会把数据全部存在内存之中，断电后会挂掉，数据不能超过内存大小。redis 有部分数据存在硬盘上，这样能保证数据的持久性。
2. **数据支持类型上** ：memcache 对数据类型的支持简单，只支持简单的 key-value，，而 redis 支持五种数据类型。
3. **value 的大小** ：redis 可以达到 1GB，而 memcache 只有 1MB。

## Redis的淘汰策略

![image-20201009145937806](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20201009145937806.png)

## redis 持久化机制

redis 为了保证效率，数据缓存在了内存中，但是会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件中，以保证数据的持久化。Redis 的持久化策略有两种：RDB、AOF，Redis 默认是快照 RDB 的持久化方式。

### RDB

**介绍**

快照形式是直接把内存中的数据保存到一个 dump 的文件中，定时保存，保存策略。

**快照触发条件**

RDB生成快照可自动促发，也可以使用命令手动触发，以下是redis触发执行快照条件

1. 客户端执行命令save和bgsave会生成快照；
2. 根据配置文件save m n规则进行自动快照；
3. 主从复制时，从库全量复制同步主库数据，此时主库会执行bgsave命令进行快照；
4. 客户端执行数据库清空命令FLUSHALL时候，触发快照；
5. 客户端执行shutdown关闭redis时，触发快照；

**save命令触发**

客户端执行save命令，该命令强制redis执行快照，这时候redis处于阻塞状态，不会响应任何其他客户端发来的请求，直到RDB快照文件执行完毕，所以请慎用。

**bgsave命令触发**

bgsave命令可以理解为background save即：“后台保存”。当执行bgsave命令时，redis会fork出一个子进程来执行快照生成操作，需要注意的redis是在fork子进程这个简短的时间redis是阻塞的（此段时间不会响应客户端请求，），当子进程创建完成以后redis响应客户端请求。其实redis自动快照也是使用bgsave来完成的。

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/1075473-20180725172641202-1573986143.png)

**save m n规则触发** 

save m n规则说明：在指定的m秒内，redis中有n个键发生改变，则自动触发bgsave。该规则默认也在redis.conf中进行了配置，并且可组合使用，满足其中一个规则，则触发bgsave，以save 900 1为例，表明当900秒内至少有一个键发生改变时候，redis触发bgsave操作。

**优点：**

1. RDB 是一个非常紧凑（compact）的文件，体积小，因此在传输速度上比较快，因此适合灾难恢复。 
2. RDB 可以最大化 Redis 的性能：父进程在保存 RDB 文件时唯一要做的就是 `fork` 出一个子进程，然后这个子进程就会处理接下来的所有保存工作，父进程无须执行任何磁盘 I/O 操作。
3. RDB 在恢复大数据集时的速度比 AOF 的恢复速度要快。

**缺点：**

1. RDB是一个快照过程，无法完整的保存所以数据，尤其在数据量比较大时候，一旦出现故障丢失的数据将更多。
2. 当redis中数据集比较大时候，RDB由于RDB方式需要对数据进行完成拷贝并生成快照文件，fork的子进程会耗CPU，并且数据越大，RDB快照生成会越耗时。
3. RDB文件是特定的格式，阅读性差，由于格式固定，可能存在不兼容情况。

### AOF

AOF可以将Redis执行的**每一条写命令追加到磁盘文件(appendonly.aof)中**,在redis启动时候优先选择从AOF文件恢复数据。由于每一次的写操作，redis都会记录到文件中，所以开启AOF持久化会对性能有一定的影响。

redis提供了三种**同步策略**同步命令到硬盘

```properties
appendfsync always    #每次有数据修改发生时都会写入AOF文件,这样会严重降低Redis的速度
appendfsync everysec  #每秒钟同步一次，显示地将多个写命令同步到硬盘,默认设置
appendfsync no        #让操作系统决定何时进行同步
```

**AOF重写**：当开启的AOF时，随着时间推移，AOF文件会越来越大,当然redis也对AOF文件进行了优化，即触发AOF文件重写条件（后续会说明）时候，redis将使用bgrewriteaof对AOF文件进行重写。这样的好处在于减少AOF文件大小，同时有利于数据的恢复。

**重写触发条件** 

手动触发：客户端执行bgrewriteaof命令。

自动触发：自动触发通过以下两个配置协作生效：

- auto-aof-rewrite-min-size: AOF文件最小重写大小，只有当AOF文件大小大于该值时候才可能重写,4.0默认配置64mb。
- auto-aof-rewrite-percentage：当前AOF文件大小和最后一次重写后的大小之间的比率等于或者等于指定的增长百分比，如100代表当前AOF文件是上次重写的两倍时候才重写。　

**重写过程**

​	![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/1075473-20180726171841786-525684493.png)

**优点：**

1. 数据更完整，秒级数据丢失(取决于设置fsync策略)。
2. 兼容性较高，由于是基于redis通讯协议而形成的命令追加方式，无论何种版本的redis都兼容，再者aof文件是明文的，可阅读性较好。

**缺点：**

1. 数据文件体积较大,即使有重写机制，但是在相同的数据集情况下，AOF文件通常比RDB文件大。
2. 相对RDB方式，AOF速度慢于RDB，并且在数据量大时候，恢复速度AOF速度也是慢于RDB。
3. 由于频繁地将命令同步到文件中，AOF持久化对性能的影响相对RDB较大，但是对于我们来说是可以接受的。

### RDB-AOF混合持久化

**混合持久化**就是同时结合RDB持久化以及AOF持久化混合写入AOF文件。这样做的好处是可以结合 rdb 和 aof 的优点, 快速加载同时避免丢失过多的数据，缺点是 aof 里面的 rdb 部分就是压缩格式不再是 aof 格式，可读性差。

4.0版本的**混合持久化默认关闭**的，通过aof-use-rdb-preamble配置参数控制，yes则表示开启，no表示禁用，默认是禁用的，可通过config set修改。

**混合持久化过程**

混合持久化同样也是通过bgrewriteaof完成的，不同的是当开启混合持久化时，fork出的子进程先将共享的内存副本全量的以RDB方式写入aof文件，然后在将重写缓冲区的增量命令以AOF方式写入到文件，写入完成后通知主进程更新统计信息，并将新的含有RDB格式和AOF格式的AOF文件替换旧的的AOF文件。简单的说：新的AOF文件前半段是RDB格式的全量数据后半段是AOF格式的增量数据，如下图：

![img](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/1075473-20180726181756270-1907770368.png)

**优点：**

1. 混合持久化结合了RDB持久化 和 AOF 持久化的优点, 由于绝大部分都是RDB格式，加载速度快，同时结合AOF，增量的数据以AOF方式保存了，数据更少的丢失。

**缺点：**

1. 兼容性差，一旦开启了混合持久化，在4.0之前版本都不识别该aof文件，同时由于前部分是RDB格式，阅读性较差

 

## Redis单线程模型



redis的单线程模型指的是其文件事件处理器是单线程的，文件事件处理器在执行时是顺序、同步的从队列里取数据，再经由不同的事件处理器进行分发处理；

下面通过客户端和服务端的通讯过程详解单线程模型执行的流程

1、客户端向服务端发起socket连接，此时产生一个AE_READABLE事件，触发连接应答事件处理器，连接应答处理器为客户端创建一个socket，并将该socket的AE_READABLE事件和读事件处理器关联，关联后再次触发AE_READABLE事件时将由读事件处理器处理

2、客户端发送set key value命令到server端，产生一个AE_READABLE事件，IO多路复用程序监听到之后将器压入队列中，再由文件事件处理器操作内存中的数据库，之后将该socket的AE_WRITABLE事件与写事件处理器关联

3、待客户端准备好接受数据后产生一个AE_WRITABLE事件，IO多路复用程序监听到之后将器压入队列中，再由文件事件处理器返回请求结果ok，之后将该socket的AE_WRITABLE事件与写事件处理器解除关联

## 参考

[链接一](https://www.cnblogs.com/wdliu/p/9377278.html)

[链接二](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486396&idx=1&sn=72417f3b8e21e878f64a4f10ddc10340&chksm=cea24477f9d5cd613a90e9472a76d55476461b4607c97311d04d38ea4fa073e2da021dbdd3ba&mpshare=1&scene=1&srcid=&sharer_sharetime=1584526459548&sharer_shareid=cb5a6d3d4b4a0a46dd0a8a8b3f84dc08&key=362c475b03eb9012ef1d534ff79cb8cb4309f7382a927a89dd09ca267aadaa6761758cd43c2acd767a3a2dd1908e2d4c0cdfa9c0e9d7e09abfb4df1bd2701263d3ac67c7585b702d358d94c2882092d6&ascene=1&uin=MTM2NzM2MTczOQ%3D%3D&devicetype=Windows+10&version=62080079&lang=zh_CN&exportkey=A%2FUsH%2F3z7iU2mnDOGgXz7uA%3D&pass_ticket=EC6JgWZp7JAPbinzrEtMZiOdDNAYbtzkRaV8e9VepSUMf8JoTuuc1TyVzi5ltuFq)