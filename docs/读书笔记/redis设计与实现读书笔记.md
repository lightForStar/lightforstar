# redis设计与实现读书笔记

## 第二章 SDS

redis为了高性能以及二进制安全等特性实现了自己的字符串类型简单动态字符串(SDS)，在redis中除了常量的表示是用c语言的字符串类型（char类型数组），其他的地方都是使用SDS

### SDS的结构

SDS有free，len，used三个属性构成，free表示字符串中分配了但未使用的空间，len表示字符串长度，buf表示已经字节数组(c语言中char类型存入的是二进制的值，一个字节)，并且SDS最后一个字符也是'/0'；

![image-20201211162043802](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131423.png)



### redis为什么要自定义字符串类型而不是用c语言的

#### 使用预分配内存和惰性释放的策略提高字符串扩缩容的性能

c语言中的字符串是一个字符数组，在进行增减字符的数量时必须要提前分配内存或减少内存，如果不提前分配内存就会造成越界写入，如果不减少内存那么就会造成内存泄漏。

分配内存涉及到操作系统底层的系统调用，需要耗费比较大的性能，如果字符串没进行一次扩缩容都需要进行系统调用那么这对于redis来说是不可以接收的，为了解决这个问题redis采取了预分配的策略。

例如下图字符串需要拼接 'Redis'，那么由于空间不够必须扩容，扩容后拼接后len为10，并且free也为10字节，如果字符串的大型不超过1M那么每次扩容free和len都是相等的，如果超过了1M，每次free增长1M；分配完后free有10字节，此时再次拼接'Redis'时不需要再次扩容直接使用已有的free空间，通过预分配策略进行n次扩容最多进行n次内存分配![image-20201211164153475](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131424.png)



惰性空间释放
 惰性空间释放用于优化 SDS 的字符串缩短操作： 当 SDS 的 API 需要缩短 SDS 保存的字符串时， 程序并不立即使用内存重分配来回收缩短后多出来的字节， 而是使用 free 属性将这些字节的数量记录起来， 并等待将来使用。通过惰性空间释放策略， SDS 避免了缩短字符串时所需的内存重分配操作， 并为将来可能有的增长操作提供了优化。与此同时， SDS 也提供了相应的 API ， 让我们可以在有需要时， 真正地释放 SDS 里面的未使用空间， 所以不用担心惰性空间释放策略会造成内存浪费

#### SDS字符串支持二进制安全

如果是c语言的字符串，如果我们存入的字符串包含'/0'字符，那么在获取的时候'/0'后面的字符都会被截断，造成缺失，因此c语言的字符串不能用来存储二进制相关的数据，但是SDS可以，SDS在取数据时是根据len的长度获取，不会受到'/0'的影响

#### 获取长度时间复杂度为O(1)

SDS保存了字符串长度，O(1)时间内即可获取到，但是c语言的字符串需要遍历每一个字符才能知道长度，时间复杂度为O(n)

### c语言字符串和SDS的主要区别

![image-20201211170223371](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131425.png)

## 第三章 链表

c语言并没有自带的链表数据结构，redis实现了自己的链表结构，redis的链表结构分为list(表头)和node(节点)两部分

### 节点

![image-20201211171728197](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131426.png)

### 表头

![image-20201211171825290](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131427.png)

总体结构

![image-20201211171927755](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131428.png)

redis的链表是双向无环的，并且能在O(1)时间找到头结点、尾结点、长度、每一个节点的pre和next

## 第四章 字典

字典是存储键值对的数据结构，也是Redis数据库的底层实现，当我们使用set key value命令的时候，redis会在数据库的字典上新增一个键为key，值为value的键值对，字典使用了哈希表作为底层的数据结构。

### redis中哈希表的定义

![image-20201214094243899](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131429.png)

哈希表数组指向的都是一个个dictEntry结构的节点指针，dictEntry是键值对的结构

![image-20201214094517325](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131430.png)

v的值可以是一个指针或者uint64/int64的整数，next的作用是解决哈希冲突，计算到同一个索引位置时采用链地址法解决冲突，在索引位置的头部插入新增的键值对



### redis中字典的定义

![image-20201214095123114](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131431.png)

type属性可以理解为一组带有泛型的函数，为了实现不同类型的字典的公共功能，privdata保存了需要传给type中函数的可选参数

type中包含的函数：

![image-20201214095613223](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131432.png)

ht属性包含了两个哈希表的数组，一般情况下我们只会使用ht[0]这个哈希表，ht[1]是为扩容准备的，rehashidx这个属性也是扩容时会使用到的，正常状态该属性的值为-1；

![image-20201214095950512](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131433.png)

### 哈希算法与哈希冲突

redis的哈希表的哈希算法采用MurmurHash算法，优点在于规律性输入的情况下仍然能有很好的随机分布性，哈希冲突时使用链地址法，采用头插法插入新增的键值对，在同一个索引值下，如果一开始的键值对是k0-v0，新增一个有冲突的键值对后变成了k1-v1 -> k0-v0，由于采用了头插法所以后插入的反而在前面，采用头插法的原因在于性能好，哈希表的链表没有保存最后一个元素的指针，只有第一个元素的指针，能O(1)时间内查找头元素

### rehash

#### 扩容、缩容触发的条件

负载因子loader = ht[0].used/ht[0].size

扩容：

1、在没有执行BGSAVE或者BGREWIREAOF时，当哈希表的负载因子大于1时触发

2、在有执行BGSAVE或者BGREWIREAOF时，当哈希表的负载因子大于5时触发

缩容：

1、当负载因子小于0.1时执行

#### 扩容、缩容触发后哈希表的大小

扩容后哈希表的大小为大于原哈希表大小的第一个2^n，例如原哈希表的大小为6，那么扩容后的大小为8(2^3)

缩容后哈希表的大小为小于原哈希表大小的第一个2^n，例如原哈希表的大小为6，那么缩容后的大小为4(2^2)

#### rehashe的流程

1、确定rehash后哈希表的大小(扩容、缩容)

2、新建一个哈希表ht[1]

3、rehashidx变为0，逐步将键值对迁移到哈希表ht[1]中

#### 渐进式迁移哈希表中的键值对

为什么不一次性迁移？

当哈希表的键值对数量非常大时一次性迁移会造成大量的计算(hash计算)和迁移操作，占用cpu时间导致redis性能下降

迁移流程

1、新建一个哈希表ht[1]，rehashidx变为0，每迁移完一个键值对rehashidx加一；

2、有新增的键值对全部加入到ht[1]中，有查找、更新和删除操作会同时在两个哈希表中查找并进行操作；

3、迁移完成后释放ht[0]空间，将ht[1]复制给ht[0]，ht[1]清空

## 第五章 跳跃表

跳表是一种**有序**的数据结构，通过增加指向其他节点的指向达到快速查找节点的目的，是一种用空间换时间的数据结构，平均查找时间复杂度为0(logn)

redis有序集合sort set的底层实现之一是跳跃表。

![image-20201218200405552](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131434.png)

在redis中跳表也分为两部分表头和节点

### 表头

表头包含头结点和尾结点、节点数量、表中层数最大的节点层数

![image-20201218195637616](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131435.png)



### 节点

节点包含层数组对象、分值、后退指针，层数组包含前进指针以及前进跨度，每一层可能指向不同跨度的节点，注意：与表头关联的第一个节点的层数是最大的一般有32层，每个节点插入到跳跃表时都是有序的按分值从小到大，层数都是随机的

![image-20201218195811354](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131436.png)

## 第六章 整数集合

当一个集合只包含元素并且数量不多的时候会使用整数集合数据结构保存，整数集合的底层是一个有序数组(从小到大)，有序确保插入时保证唯一

### 结构

![image-20201222201519761](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131437.png)

编码方式可以是int16_t、int_32_t或者int_64_t，length保存数组长度

![image-20201222201910849](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131438.png)

### 编码升级

当编码为int_16_t的集合中加入了65535这个整数时，由于65535比int_16_t编码表示的最大值还大，所以加入之前需要对集合进行升级操作，升级时每一位数字都转换为int_32_t编码32位表示一个整数，需要重新分配内存和移动数字的占用位数。升级之后不支持降级操作

## 第七章压缩链表

当一个列表键包含少量的列表项，并且每个列表项要么是小整数值要么是长度比较短的字符串，redis就会选择压缩链表作为列表键的数据结构

### 结构

![image-20201222202720144](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131439.png)

![image-20201222203210794](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131440.png)

previous_entry_length以字节为单位保存前一个节点的长度，previous_entry_length的长度可以为1字节或5字节，当前一个节点的长度254字节用一个字节保存，当前一节点的长度大于等于254用五个字节保存，并且第一个字节设置为0xFE(十进制254)，后四个字节保存长度

### 连锁升级

当存在连续多个节点的大小都在250-253字节e1-eN，那么每一个节点的previous_entry_length都只需要一个字节保存，如果这个时候新增了一个长度大于254字节的节点作为表头，那么最初的表头的previous_entry_length必须扩容成5个字节，后续的节点也必须跟着扩容，这就是连锁升级。删除也可能导致连锁更新，例如有一个big节点的长度大于254，那么下一个节点small的previous_entry_length就必须要5个字节才能保存，如果删除了下一个节点，那么之后的节点必须要扩容previous_entry_length以保存big节点的长度。

![image-20201227101123692](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131441.png)

![image-20201227101037921](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131442.png)

## 第八章 对象

在redis中，键值对真正的存储形式是一个个的对象，每一个对象都有相对应的数据结构，基于对象我们可以很方便的判断一个对象是否可以执行给定的命令。redis的对象系统包含字符串对象、列表对象、哈希对象、集合对象、有序对象

### 对象的结构

redis中每个对象都由一个redisObject结构描述，包括type、encoding、ptr属性

![image-20201227103232260](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131443.png)

### 类型

type属性记录了对象的类型，对redis数据库保存的键值对而言，key总是字符串对象、value可以是五种对象其中之一

![image-20201227103609153](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131445.png)

### 编码和底层实现

ptr属性执行了对象底层数据结构，encoding属性指定了要采用哪一种数据结构，使用编码可以为同一类型对象指定不同的数据结构以适应各种场景

encoding的值选型：

![image-20201227104615519](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131446.png)

### 字符串对象

字符串对象的编码可以是int、raw、embstr

适用场景

int：整数值且可以用long类型表示（没有超出这个数值范围）

raw：字符串值且长度大于32字节

embstr：字符串值且长度小于等于32字节

embstr是专门为保存短字符串的一种优化编码方式，和raw编码一样都使用redisObject和sdshdr结构表示字符串，但是raw编码会调用两次内存分配函数分别创建redisObject结构和sdshdr结构，embstr只调用一次内存分配函数分配一块连续的空间，空间中依次包含了redisObject结构和sdshdr结构，如下图：

![image-20201227105823810](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131447.png)

使用embs编码的好处：

- 创建字符串对象内存分配次数由raw的两次降为一次
- 释放内存也只需要一次
- redisObjec对象和sdshdr对象的内存地址是连续的，能更好的利用缓存的优势

![image-20201227110343374](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131448.png)

**字符串对象是唯一种会被其他四种类型对象嵌套的对象**

### 列表对象

列表对象有ziplist编码和linkedlist编码

![image-20201227110647553](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131449.png)

![image-20201227110735751](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131450.png)

适用场景：

ziplist：列表对象保存的字符串元素的长度都小于64字节且元素数量小于512个

linkedlist：不能满足ziplist编码条件的都用linkedlist表示

### 哈希对象

哈希对象的编码有ziplist和hashtable

编码为ziplist时，每添加一个键值对都是添加在压缩链表的尾部，key在前，value在后，后添加的键值对继续添加在表尾

![image-20201227113318432](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131451.png)

ziplist编码如何保证key的唯一性？

猜测：插入前先查找是否存在这个key存在就覆盖

![image-20201227113347044](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131452.png)

编码的适用场景

ziplist：key和value的长度都小于64字节且保存的键值对数量小于512个

hashtable：除了ziplist之外的条件

### 集合对象

集合对象的编码可以是intset和hashtable

两种编码的结构实例：

![image-20201227113952406](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131453.png)

编码适用的场景

intset：元素都是整数值且数量不超过512个

hashtable：除intset之外的其他场景

### 有序集合

有序集合的编码可以是ziplist和skiplist

ziplist编码的底层是压缩链表，每个集合元素使用两个紧挨着的压缩链表节点保存，第一个节点保存元素的成员，第二个元素保存元素的分值，集合元素按分值从小到大的顺序进行排序，分值小的靠近表头

![image-20201227114831038](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131454.png)

skiplist编码

结构：

![image-20201227114945304](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131455.png)

zset结构中的zsl跳跃表按分值从小到大保存了所有集合元素，每个跳跃表节点保存了一个集合元素，object属性保存成员，score属性保存分值，通过这个跳跃表就可以进行范围查找，此外dict字典保存了成员到分值的映射，字典的键保存了元素，值保存了分值，通过这个字典可以O(1)时间内找到元素对应的分值

![image-20201227120438863](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131130.png)

编码的适用场景：

ziplist：保存的元素小于128个且长度元素长度都小于64字节

skiplist：除ziplist外的其他场景

### 内存回收

c语言自身不具备自动内存回收功能，所以redis基于引用计数法自己实现了对象内存回收的机制

![image-20201227124801308](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/20201227131106.png)

对象的引用信息会随着使用状态发生改变

- 创建新对象时，refCount会初始化为1
- 当对象被引用时引用计数值会加一
- 当不被引用时会减一
- 当对象的引用计数值变为0时，对象所占用的内存会被释放

### 对象共享

当键A创建了一个整数值为100的字符串对象作为值对象，而B对象也需要一个整数值为100的字符串对象作为值对象，那么这时候可以有以下两种做法：

- 为键B再创建一个对象
- 键B共享键A创建的对象

在redis中使用第二种方式，这样更节约内存

让多个键共享同一个值对象需要执行以下两个步骤：

- 将数据库的键的值对象指向一个现有的值对象
- 将被共享的值对象的引用计数加一

