# redis设计与实现读书笔记

## 第二章 SDS

redis为了高性能以及二进制安全等特性实现了自己的字符串类型简单动态字符串(SDS)，在redis中除了常量的表示是用c语言的字符串类型（char类型数组），其他的地方都是使用SDS

### SDS的结构

SDS有free，len，used三个属性构成，free表示字符串中分配了但未使用的空间，len表示字符串长度，buf表示已经字节数组(c语言中char类型存入的是二进制的值，一个字节)，并且SDS最后一个字符也是'/0'；

![image-20201211162043802](/Users/zgg/Library/Application Support/typora-user-images/image-20201211162043802.png)



### redis为什么要自定义字符串类型而不是用c语言的

#### 使用预分配内存和惰性释放的策略提高字符串扩缩容的性能

c语言中的字符串是一个字符数组，在进行增减字符的数量时必须要提前分配内存或减少内存，如果不提前分配内存就会造成越界写入，如果不减少内存那么就会造成内存泄漏。

分配内存涉及到操作系统底层的系统调用，需要耗费比较大的性能，如果字符串没进行一次扩缩容都需要进行系统调用那么这对于redis来说是不可以接收的，为了解决这个问题redis采取了预分配的策略。

例如下图字符串需要拼接 'Redis'，那么由于空间不够必须扩容，扩容后拼接后len为10，并且free也为10字节，如果字符串的大型不超过1M那么每次扩容free和len都是相等的，如果超过了1M，每次free增长1M；分配完后free有10字节，此时再次拼接'Redis'时不需要再次扩容直接使用已有的free空间，通过预分配策略进行n次扩容最多进行n次内存分配![image-20201211164153475](/Users/zgg/Library/Application Support/typora-user-images/image-20201211164153475.png)



惰性空间释放
 惰性空间释放用于优化 SDS 的字符串缩短操作： 当 SDS 的 API 需要缩短 SDS 保存的字符串时， 程序并不立即使用内存重分配来回收缩短后多出来的字节， 而是使用 free 属性将这些字节的数量记录起来， 并等待将来使用。通过惰性空间释放策略， SDS 避免了缩短字符串时所需的内存重分配操作， 并为将来可能有的增长操作提供了优化。与此同时， SDS 也提供了相应的 API ， 让我们可以在有需要时， 真正地释放 SDS 里面的未使用空间， 所以不用担心惰性空间释放策略会造成内存浪费

#### SDS字符串支持二进制安全

如果是c语言的字符串，如果我们存入的字符串包含'/0'字符，那么在获取的时候'/0'后面的字符都会被截断，造成缺失，因此c语言的字符串不能用来存储二进制相关的数据，但是SDS可以，SDS在取数据时是根据len的长度获取，不会受到'/0'的影响

#### 获取长度时间复杂度为O(1)

SDS保存了字符串长度，O(1)时间内即可获取到，但是c语言的字符串需要遍历每一个字符才能知道长度，时间复杂度为O(n)

### c语言字符串和SDS的主要区别

![image-20201211170223371](/Users/zgg/Library/Application Support/typora-user-images/image-20201211170223371.png)

## 第三章 链表

c语言并没有自带的链表数据结构，redis实现了自己的链表结构，redis的链表结构分为list(表头)和node(节点)两部分

节点：

![image-20201211171728197](/Users/zgg/Library/Application Support/typora-user-images/image-20201211171728197.png)

表头：

![image-20201211171825290](/Users/zgg/Library/Application Support/typora-user-images/image-20201211171825290.png)

总体结构

![image-20201211171927755](/Users/zgg/Library/Application Support/typora-user-images/image-20201211171927755.png)

redis的链表是双向无环的，并且能在O(1)时间找到头结点、尾结点、长度、每一个节点的pre和next

## 第四章 字典

字典是存储键值对的数据结构，也是Redis数据库的底层实现，当我们使用set key value命令的时候，redis会在数据库的字典上新增一个键为key，值为value的键值对，字典使用了哈希表作为底层的数据结构。

### redis中哈希表的定义

![image-20201214094243899](/Users/zgg/Library/Application Support/typora-user-images/image-20201214094243899.png)

哈希表数组指向的都是一个个dictEntry结构的节点指针，dictEntry是键值对的结构

![image-20201214094517325](/Users/zgg/Library/Application Support/typora-user-images/image-20201214094517325.png)

v的值可以是一个指针或者uint64/int64的整数，next的作用是解决哈希冲突，计算到同一个索引位置时采用链地址法解决冲突，在索引位置的头部插入新增的键值对



### redis中字典的定义

![image-20201214095123114](/Users/zgg/Library/Application Support/typora-user-images/image-20201214095123114.png)

type属性可以理解为一组带有泛型的函数，为了实现不同类型的字典的公共功能，privdata保存了需要传给type中函数的可选参数

type中包含的函数：

![image-20201214095613223](/Users/zgg/Library/Application Support/typora-user-images/image-20201214095613223.png)

ht属性包含了两个哈希表的数组，一般情况下我们只会使用ht[0]这个哈希表，ht[1]是为扩容准备的，rehashidx这个属性也是扩容时会使用到的，正常状态该属性的值为-1；

![image-20201214095950512](/Users/zgg/Library/Application Support/typora-user-images/image-20201214095950512.png)

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