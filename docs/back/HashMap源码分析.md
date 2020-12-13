# 哈希表
## 哈希表定义
哈希表（Hash table，也叫散列表），是根据键（Key）而直接访问在内存存储位置的数据结构。也就是说，它通过计算一个关于键值的函数，将所需查询的数据映射到表中一个位置来访问记录，这加快了查找速度。这个映射函数叫做散列函数，存放记录的数组叫做散列表


## 图解

哈希表的本质其实就是数组加上链表，这是一种综合了数组和链表特性的数据结构，是一种以空间换时间的做法，利用数组的下标能直接定位到链表的首地址，下面图示展示了其结构



![image](https://s2.ax1x.com/2020/03/01/3cJhEn.png)


- 我们能看到第一部分就是数组，数组的优势在于查找快时间复杂度为O(1)，增删慢时间复杂度为O(n)，而数组存放发便是链表的地址，也可以称之为索引，我们可以利用散列函数对存放的值进行计算决定该值存放在哪一个位置。
- 第二部分为链表，链表查找慢，增删快，查找的时间复杂度为O(n)，增删的时间复杂度为O(1)；哈希表结合了数组和链表的特点，在查找和增删方面都有着不错的性能。



## 哈希表的数据存储方式
了解哈希碰撞之前我们首先得了解哈希表是怎么存储数据的，例如上图，我们想把55存进哈希表里，那么首先我们会设计一个散列函数，设计这个散列函数的目的是为了让我们存储的数据尽量的均匀分布在哈希表里，如果我们的数据都只存放在下标为0的链表中，那么哈希表就会退化成链表。那么如何做到均匀呢？我们会采取这样的措施，把要存放的数据的某一个值对数组的长度取余，得到的结果作为存放在数组中的位置，例如上图，我们要存放13这个数字，我们可以用13对数组长度11取余，得到的结果是2，那么13这个数字就被存放在了数组下标为2的位置。

**散列函数：hash = value%Array.length**

## 哈希碰撞
我们知道，对于散列函数，我们输入不同的参数，得到的结果也可能一样的，例如上图中的13和24取余得到的结果都是2，那么这个时候我们该存放在数组的哪个位置呢？这样就是产生了哈希碰撞，不同的存储数据通过散列函数得到同样的哈希值。


## 如何解决哈希碰撞

- 解决哈希碰撞有很多种办法，以下给出常见的几种方法

### 1、开放地址法
开放地址法解决哈希碰撞的措施就是避开已经被占用的数组位置，再重新找一个未被占用的位置。

根据查找下一个未被占用位置的方式又可以分为
- **线性探测法**
```
d= l, 2, 3, …, m-1 (d为每一次查找位移量)
这种探测方法可以将散列表假想成一个循环表，发生冲突时，从冲突地址的下一单元顺
序寻找空单元，如果到最后 一个位置也没找到空单元，则回到表头开始继续查找，直到找到
一个空位，就把此元素放入此空位中。如果找不到空位，则说明散列表已满，需要进行溢出
处理。
```
- **二次探测法**

![image](https://s2.ax1x.com/2020/03/01/3cy92j.png)

```
这种探测方法的好处就在于可以双向查找可用位置
```
- **伪随机数探测法**
```
d通过随机函数计算
```

### 2、链地址法
开放地址法的思路是遇到冲突就避开，而链地址法的思路是继续留在原地，只不过用了链表的方式把冲突的数据连接起来，发生冲突后把新存入的数据挂在链表的尾部。图示采取的就是链地址法。


### 3、再散列法
```
同时准备多个散列函数，每次发生冲突时换一个散列函数计算，直到不发生冲突
```


# HashMap（JDK1.8）
## 介绍
- HashMap是util包下的一个类，实现了哈希表的数据结构（链地址法），并且允许null值的key和value，HashMap是不同步的。

- HashMap存储的是键值对结构的对象。

## 底层源码的分析

### HashMap的接口关系
```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable
```


### 源码中的常量说明
```java

    //哈希表默认的数组容量为16
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

    /**
     *  最大的数组容量为2的30次方
     * The maximum capacity, used if a higher value is implicitly specified
     * by either of the constructors with arguments.
     * MUST be a power of two <= 1<<30.
     */
    static final int MAXIMUM_CAPACITY = 1 << 30;

    /**
     *  默认负载因子大小，扩容时会用到
     * The load factor used when none specified in constructor.
     */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    /** 转化为红黑树的节点数量门槛，当一个链表的长度大于8时链表就会转为红黑树
     * The bin count threshold for using a tree rather than list for a
     * bin.  Bins are converted to trees when adding an element to a
     * bin with at least this many nodes. The value must be greater
     * than 2 and should be at least 8 to mesh with assumptions in
     * tree removal about conversion back to plain bins upon
     * shrinkage.
     */
    static final int TREEIFY_THRESHOLD = 8;

    /**
     * 退还为链表的节点数量门槛，当红黑树节点数小于6时退化为链表
     * The bin count threshold for untreeifying a (split) bin during a
     * resize operation. Should be less than TREEIFY_THRESHOLD, and at
     * most 6 to mesh with shrinkage detection under removal.
     */
    static final int UNTREEIFY_THRESHOLD = 6;

    /** 转换为红黑树的最小节点数
     * The smallest table capacity for which bins may be treeified.
     * (Otherwise the table is resized if too many nodes in a bin.)
     * Should be at least 4 * TREEIFY_THRESHOLD to avoid conflicts
     * between resizing and treeification thresholds.
     */
    static final int MIN_TREEIFY_CAPACITY = 64;
    
    
    
    
    /**  哈希表，存放链表的数组，下面说的哈希表的长度指的是数组的长度
     * The table, initialized on first use, and resized as
     * necessary. When allocated, length is always a power of two.
     * (We also tolerate length zero in some operations to allow
     * bootstrapping mechanics that are currently not needed.)
     */
    transient Node<K,V>[] table;
    
    /**存储键值对的数量
     * The number of key-value mappings contained in this map.
     */
    transient int size;
    
    
    /**  扩容的门槛，也叫阈值
     * The next size value at which to resize (capacity * load factor).
     *
     * @serial
     */
    // (The javadoc description is true upon serialization.
    // Additionally, if the table array has not been allocated, this
    // field holds the initial array capacity, or zero signifying
    // DEFAULT_INITIAL_CAPACITY.)
    int threshold;

    /** 负载因子，用这个和哈希表的长度计算threshold的值  threshold = loadFactor * 哈希表的长度
     * The load factor for the hash table.
     *
     * @serial
     */
    final float loadFactor;
    
```


### 创建HashMap
- 在JDK1.8中，HashMap提供了三种构造方法用于创建一个HashMap

```java
    /**
     * Constructs an empty <tt>HashMap</tt> with the specified initial
     * capacity and load factor.
     *
     * @param  initialCapacity the initial capacity
     * @param  loadFactor      the load factor
     * @throws IllegalArgumentException if the initial capacity is negative
     *         or the load factor is nonpositive
     */
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }

    /**
     * Constructs an empty <tt>HashMap</tt> with the specified initial
     * capacity and the default load factor (0.75).
     *
     * @param  initialCapacity the initial capacity.
     * @throws IllegalArgumentException if the initial capacity is negative.
     */
    public HashMap(int initialCapacity) {
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }

    /**
     * Constructs an empty <tt>HashMap</tt> with the default initial capacity
     * (16) and the default load factor (0.75).
     */
    public HashMap() {
        this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
    }

```
**这里主要我们关注几点**
- 在这几种构造函数都没有初始化table变量，table始终都是null；
- public HashMap(int initialCapacity, float loadFactor)这个构造函数计算threshold的时候调用了tableSizeFor函数


**tableSizeFor方法**
这个方法是为了得到一个2的倍数的容量，当我们调用HashMap的构造方法时可以手动传入哈希表的长度（数组长度）
```java
    static final int tableSizeFor(int cap) {
        //这里减1的作用是为了避免cap本来就是2的n次幂
        int n = cap - 1;
        //将n右移1位并且与n进行与操作，这里的意思是如果n为10，进行这个10 |1后n会变成11，最后n的最高位以下每一位都会是1
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```
- **注意，返回的结果最后是加了1的，这样就保证了返回的数据一定是2的倍数**


- 这里我们举一个例子，假设输入的是一个32位的2进制数，x表示0或1均可,每一次进行右移之后的或运算都会有0变成1，一开始是1位，2位，4位，8位，16位。
```
	   n=            1xxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
	  n |= n >>> 1;  11xx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  将最高位拷贝到下1位
	  n |= n >>> 2;  1111 xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  将上述2位拷贝到紧接着的2位
	  n |= n >>> 4;  1111 1111  xxxx xxxx  xxxx xxxx  xxxx xxxx  将上述4位拷贝到紧接着的4位
	  n |= n >>> 8;  1111 1111  1111 1111  xxxx xxxx  xxxx xxxx  将上述8位拷贝到紧接着的8位
	  n |= n >>> 16; 1111 1111  1111 1111  1111 1111  1111 1111  将上述16位拷贝到紧接着的16位
```


- int n = cap - 1;减一操作的作用举例,这里以cap为8进行举例
```
    int n = cap -1; //此时n为7对应二进制为 111
    
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    //进行了上面的操作之后，n还是111
    //最终返回n+1还是8，这样输入的如果是2的倍数就不会改变输入的值；
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;

```




### HashMap中key，vale键值对的结构
```java
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;

        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }

        public final K getKey()        { return key; }
        public final V getValue()      { return value; }
        public final String toString() { return key + "=" + value; }

        public final int hashCode() {
            return Objects.hashCode(key) ^ Objects.hashCode(value);
        }

        public final V setValue(V newValue) {
            V oldValue = value;
            value = newValue;
            return oldValue;
        }

        public final boolean equals(Object o) {
            if (o == this)
                return true;
            if (o instanceof Map.Entry) {
                Map.Entry<?,?> e = (Map.Entry<?,?>)o;
                if (Objects.equals(key, e.getKey()) &&
                    Objects.equals(value, e.getValue()))
                    return true;
            }
            return false;
        }
    }
```
**可以看到HashMap中存放的是一个个的节点，每一个节点都由int类型的hash值，key，value，和下一个节点的地址组成**




### HashMap中对key取hash值（哈希表的散列函数）
```java
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
```

我们可以从源码中看到，HashMap的散列函数除了使用节点自身的hashCode函数外，还与自身右移16位后的值进行异或操作，这又是为什么呢？还记得我们在哈希表中是怎么确定每一个值在数组中的位置吗，没错就是取余。在HashMap我们通过对hash进行取余来获得数组的下标，而在HashMap的初始化容量中，数组长度只有16，换算成2进制便是4位，那么即时hash取得很均匀也会发生碰撞，这个时候我们可以对hash做一个干扰，使用节点自身的hashCode函数并且与自身右移16位后的值进行异或操作，这样得到的值更随机。

参照[博客](https://www.cnblogs.com/zhengwang/p/8136164.html)

### HashMap中获得数组下标
```java
//直接将hash值与数组的长度进行与运算，获得低n位，这也解释了为什么数组容量要
//是2的倍数，为了方便进行位运算
(n - 1) & hash
```

### HashMap是如何存数据的
```java
    /**
     * Associates the specified value with the specified key in this map.
     * If the map previously contained a mapping for the key, the old
     * value is replaced.
     *
     * @param key key with which the specified value is to be associated
     * @param value value to be associated with the specified key
     * @return the previous value associated with <tt>key</tt>, or
     *         <tt>null</tt> if there was no mapping for <tt>key</tt>.
     *         (A <tt>null</tt> return can also indicate that the map
     *         previously associated <tt>null</tt> with <tt>key</tt>.)
     */
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }
```
- 从源码中我们可以看到调用了putVal方法，接下来让我们进一步的探究putVal方法

```java
 /**
     * Implements Map.put and related methods
     *
     * @param hash hash for key
     * @param key the key
     * @param value the value to put
     * @param onlyIfAbsent if true, don't change existing value
     * @param evict if false, the table is in creation mode.
     * @return previous value, or null if none
     */
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //如果table为null，也就是在new HashMap()的时候没有初始化，就进行扩容
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        //(n - 1) & hash相当于对表长度取余，得到数组的下标，如果下标为空，表示该位置没有值
        //，直接插入，这里的p是链表的头节点
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
            
        //该下标已经被占用了
        else {
            Node<K,V> e; K k;
            //如果key是一样的，则先把节点地址给e，在下方统一操作
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            //如果p节点是树节点，则走红黑树的插入流程
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            //头节点已有且key不重复，则在链表中查找
            else {
                //采用尾插法，注意这里的binCount从0开始计算，所以下面判断的上限以7为准
                for (int binCount = 0; ; ++binCount) {
                    //如果p.next为null，则在p.next的位置插入一个节点，退出循环
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        //链表节点的数量大于等于8个了，变换成红黑树
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    //如果p.next也就是e和要插入的节点的key相同那么退出循环，在下方统一操作
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        //存储节点的数量大于扩容的门槛，进行扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```

- HashMap存数据总结

1. 对哈希表进行初始化
2. 对存入数据的hash进行取余，获得数组下标
3. 判断数组下标是否被占用，如无数据，则将数据存为头节点，如有进行以下判断
4. 若下标已被占用，判断被占用数据是否与头节点相同（对key取hash看是否相等），是的话替换该节点
5. 若不相同，则判断该节点是否是树节点，是则进行树节点操作
6. 该节点不是树节点则我们需要在链表中查找
7. 获取头节点指向的下一个数据为e（头节点之前已经判断过），如果为null则直接在后面新增，并且判断是否满足链表转换为红黑树的条件，退出链表遍历，如果e和当前要插入数据的key相同，则替换
8. 插入后判断时候满足扩容条件


### HashMap是获取数据

```java
    /**
     * Returns the value to which the specified key is mapped,
     * or {@code null} if this map contains no mapping for the key.
     *
     * <p>More formally, if this map contains a mapping from a key
     * {@code k} to a value {@code v} such that {@code (key==null ? k==null :
     * key.equals(k))}, then this method returns {@code v}; otherwise
     * it returns {@code null}.  (There can be at most one such mapping.)
     *
     * <p>A return value of {@code null} does not <i>necessarily</i>
     * indicate that the map contains no mapping for the key; it's also
     * possible that the map explicitly maps the key to {@code null}.
     * The {@link #containsKey containsKey} operation may be used to
     * distinguish these two cases.
     *
     * @see #put(Object, Object)
     */
    public V get(Object key) {
        Node<K,V> e;
        return (e = getNode(hash(key), key)) == null ? null : e.value;
    }
```
- 从源码中我们可以看到get方法调用了getNode方法，接下来转到getNode方法

```java
    /**
     * Implements Map.get and related methods
     *
     * @param hash hash for key
     * @param key the key
     * @return the node, or null if none
     */
    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (first = tab[(n - 1) & hash]) != null) {
            if (first.hash == hash && // always check first node
                ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            if ((e = first.next) != null) {
                if (first instanceof TreeNode)
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                do {
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }
```

1. 获取key的hash值，并且用hash值取余算出在哈希表中的下标
2. 利用key判断是否与第一个值相等，若相等则返回，否则进行下一步
3. 获取到下一个节点，如果是树节点则走getTreeNode方法，否则进行下一步
4. 利用key判断当前节点的key是否与key相等，若相等则返回，不相等则回到第三步
5. 遍历完仍然没有找到匹配的则返回null


# 红黑树相关
## 红黑树的存取数据
## 链表转换为红黑树