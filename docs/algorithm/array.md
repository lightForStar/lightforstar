# 做题思路

遇到不会做的问题怎么办？

1、暴力破解，找到每一种可能性

2、找最简单的情况，找到后继续泛化，找最近重复的子问题（因为计算机只能处理if else for loop recursion）

# 数组

#### [283. 移动零](https://leetcode-cn.com/problems/move-zeroes/)

给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

示例:

输入: [0,1,0,3,12]
输出: [1,3,12,0,0]
说明:

必须在原数组上操作，不能拷贝额外的数组。
尽量减少操作次数。

思路：利用双指针法，一个指针指向数值为0的元素，另一个指针指向非零的元素，当非0指针下标大于0指针时，将非0元素往前移动，将非0元素置为0，当遍历到非0元素时，0元素指针也往前移动,一次遍历即可完成

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int j = 0;//零元素下标，初始化为0
        int length = nums.length;
        if(length == 0){
            return ;
        }

        for(int i=0;i < length;i++){
            //元素不为0
            if(nums[i] != 0){
                //非0元素下标大于0元素执行
                if(i>j){
                    //非0元素向前移动
                    nums[j] = nums[i];
                    //后面的元素置0
                    nums[i] = 0;
                }
                //如果i=j，则零元素下标继续前移，知道找到0元素下标
                j++;
            }
           
        }
    }
}
```

思路：两次遍历，用一个指针记录零元素的下标，将非0元素移动到0元素位置上，移动完成后则说明剩下的都是0元素，置零

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int j=0; //零元素下标
        for(int i=0;i<nums.length;i++){
            if(nums[i]!=0){
                nums[j] = nums[i];
                j++;
            }
        }
        //非零元素移动完成后剩下的都是0元素，直接置0
        for(int k=j;k<nums.length;k++){
            nums[k] = 0;
        }
    }
}
```

思路三：滚雪球法，每一个0认为是一个雪球，遇到0时将雪球的数量加1，遇到非0时，如果雪球数量大于0，将非0的数值与第一个雪球交换位置；

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int snowCount = 0;
        for(int i = 0; i < nums.length;i++){
            //等于0雪球数量++
            if(nums[i] == 0){
                snowCount++;
            } else if(snowCount > 0){ //雪球数量大于0
                nums[i - snowCount] = nums[i];
                nums[i] = 0;
            }
        }
    }
}
```



#### [11. 盛最多水的容器](https://leetcode-cn.com/problems/container-with-most-water/)

给你 n 个非负整数 a1，a2，...，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0)。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。

说明：你不能倾斜容器，且 n 的值至少为 2。

 ![img](https://aliyun-lc-upload.oss-cn-hangzhou.aliyuncs.com/aliyun-lc-upload/uploads/2018/07/25/question_11.jpg)



图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。

示例：

输入：[1,8,6,2,5,4,8,3,7]
输出：49

思路一：暴力破解，枚举出每一种左右边界情况，计算面积，选择出最大面积

```java
class Solution {
    public int maxArea(int[] height) {
        int max = 0;

        //两重循环枚举所有的左右边界，计算面积比较大小
        for(int i = 0;i < height.length;i++){
            for(int j = i + 1;j < height.length;j++){
                int minHeight = height[i] < height[j] ? height[i] : height[j];
                int area = minHeight * (j - i);
                if( area > max){
                    max = area;
                }
            }
        }

        return max;
    }
}
```

思路二：从两边往中间收敛，定义两个下标指向头尾，比较头尾柱子的高低，低的一方往中间收，直到两根柱子相遇

```java
class Solution {
    public int maxArea(int[] height) {
        int max = 0;
		//定义头尾下标 i，j
        for(int i=0,j=height.length - 1;i<j;){
            int minHeight = height[i] < height[j] ? height[i++] : height[j--];//低的一方往中间收敛
            int area = minHeight * (j-i + 1);
            if(area > max){
                max = area;
            }
        }
        return max;
    }
}
```



#### [70. 爬楼梯](https://leetcode-cn.com/problems/climbing-stairs/)

假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

注意：给定 n 是一个正整数。

示例 1：

输入： 2
输出： 2
解释： 有两种方法可以爬到楼顶。
1.  1 阶 + 1 阶
2.  2 阶
示例 2：

输入： 3
输出： 3
解释： 有三种方法可以爬到楼顶。

1.  1 阶 + 1 阶 + 1 阶
2.  1 阶 + 2 阶
3.  2 阶 + 1 阶

思路：由题意我们可以知道上一阶台阶只有一种方式，上两阶台阶有两种方式，上三阶台阶必须是两阶跳一阶或者是一阶跳两阶，依次类推，上n阶台阶必须要从n-1阶台阶上一阶或者是n-2阶台阶上两阶，因此我们找到了递推公式f(n) = f(n-1) + f(n-2)，由这个公式我们可以用三个变量不断迭代获取到最新的f(n)，即下方的f3，由递推公式的特点我们也可以用递归进行操作

```java
class Solution {
    public int climbStairs(int n) {
        if(n<3)
            return n;

        //定义三个变量  不断迭代
        int f1 = 1,f2 = 2,f3 = 0;

        for(int i=3;i<=n;i++){
            f3 = f1 + f2; //递推公私
            f1 = f2;
            f2 = f3;
        }

        return f3;
    }
}
```

#### [146. LRU缓存机制](https://leetcode-cn.com/problems/lru-cache/)

运用你所掌握的数据结构，设计和实现一个  LRU (最近最少使用) 缓存机制。它应该支持以下操作： 获取数据 get 和 写入数据 put 。

获取数据 get(key) - 如果关键字 (key) 存在于缓存中，则获取关键字的值（总是正数），否则返回 -1。
写入数据 put(key, value) - 如果关键字已经存在，则变更其数据值；如果关键字不存在，则插入该组「关键字/值」。当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据值，从而为新的数据值留出空间。

 

进阶:

你是否可以在 O(1) 时间复杂度内完成这两种操作？

 

示例:

LRUCache cache = new LRUCache( 2 /* 缓存容量 */ );

cache.put(1, 1);
cache.put(2, 2);
cache.get(1);       // 返回  1
cache.put(3, 3);    // 该操作会使得关键字 2 作废
cache.get(2);       // 返回 -1 (未找到)
cache.put(4, 4);    // 该操作会使得关键字 1 作废
cache.get(1);       // 返回 -1 (未找到)
cache.get(3);       // 返回  3
cache.get(4);       // 返回  4



思路：通过双向链表保存数据，并且每次插入或者查询时更新数据到链表的头部，超出容量后删除链表末尾的元素，如何做到O(1)时间？由于双向链表的插入和删除都能在O(1)时间内完成，查找链表中的元素需要O(n)时间，因此我们要想办法把每一个key对应的链表元素保存，并且能在O(1)时间内找到，因此我们选择使用哈希表保存key和节点元素的关系。



代码：

```java
class LRUCache {
    //思路：通过双向链表维护添加的元素，通过维护map做到O(1)的时间复杂度，map维护key和对应的节点。
    //1 . get操作
    //      先检查hashmap中是否存在，存在则将节点移动到链表的头部同时返回节点的值，如果不存在则返回-1；
    //2 . put操作
    //      先检查hashmap中是否存在，存在则更新节点的value同时移动节点到链表的头部，不存在则往链表的头部添加元素，添加完成后判断链表的大小是否超出容量，超出容量则删除队尾元素，同时删除hashmap中的映射。

    class DlinkList{
        public int key;
        public int value;
        public DlinkList pre;
        public DlinkList next;

        public DlinkList(){};
        public DlinkList(int key,int value){
            this.key = key;
            this.value = value;
        }
    }
    public int size;
    public int capacity;
    public DlinkList head;
    public DlinkList tail;
    public Map<Integer,DlinkList> map = new HashMap<>();


    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        //初始化双向链表的头节点和尾节点,哨兵节点
        head = new DlinkList();
        tail = new DlinkList();
        head.next = tail;
        head.pre = null;
        tail.pre = head;
        tail.next = null;
    }
    
    public int get(int key) {
        DlinkList node =  map.get(key);
        if(node == null) {
            return -1;
        }
        //把该节点移动到链表的头部
        moveToHead(node);

        return node.value;
    }
    
    public void put(int key, int value) {
        DlinkList node =  map.get(key);
        if(node == null){
            node = new DlinkList(key,value);
            addNodeToHead(node);
            map.put(key,node);
            size++;
            if(size > capacity){
                //删除尾部
                DlinkList tail =  deleteTail();
                //删除在hashmap中的数据
                if(tail!=null){
                    map.remove(tail.key);
                }
                

            }
        } else{
            node.value = value;
            moveToHead(node);
        }
    }

    private void moveToHead(DlinkList node){
        //删除该节点
        removeNode(node);
        //插入节点到链表的头部
        addNodeToHead(node);
    }

    private void removeNode(DlinkList node){
        //next指针移动
        node.pre.next = node.next;
        //pre指针移动
        node.next.pre = node.pre; 
    }
    //插入节点到头部
    private void addNodeToHead(DlinkList node){
        node.next = head.next;
        node.pre = head;
        head.next.pre = node;
        head.next = node;
    }

    private DlinkList deleteTail(){
        DlinkList node = tail.pre;
        if(node == head){
            return null;
        }
        removeNode(node);
        return node;
    }


}

/**
 * Your LRUCache object will be instantiated and called as such:
 * LRUCache obj = new LRUCache(capacity);
 * int param_1 = obj.get(key);
 * obj.put(key,value);
 */
```



#### [24. 两两交换链表中的节点](https://leetcode-cn.com/problems/swap-nodes-in-pairs/)

难度中等

给定一个链表，两两交换其中相邻的节点，并返回交换后的链表。

**你不能只是单纯的改变节点内部的值**，而是需要实际的进行节点交换。

 

**示例:**

```txt
给定 1->2->3->4, 你应该返回 2->1->4->3.
```

思路：定义三个指针，借助辅助指针pre完成交换，完成以下步骤既可以完成交换，每交换一轮，pre指针往后移动两次

​	1、pre的next指针指向future 首元素位置发送改变
​    2、cur的next指针指向future的next 交换后需要指向第三个元素
​    3、futrue的next指针指向cur完成两个元素的交换

![image-20200718173026041](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20200718173026041.png)

![image-20200718173245653](https://lightforstar.oss-cn-shenzhen.aliyuncs.com/blog/image-20200718173245653.png)

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
class Solution {
    //思路：需要三个指针，第一个指针为pre，第二个是cur，第三个是future，pre作为前置指针辅助两个节点交换始终指向待交换元素的前一个位置，cur指针指向第一个元素，futurn指针指向第二个元素
    //1、pre的next指针指向future 首元素位置发送改变
    //2、cur的next指针指向future的next 交换后需要指向第三个元素
    //3、futrue的next指针指向cur完成两个元素的交换
    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0);
        ListNode pre = dummy;
        pre = dummy;
        pre.next = head;
        while(pre.next!=null && pre.next.next!=null){
            ListNode cur = pre.next;
            ListNode future = pre.next.next;

            pre.next = future;
            cur.next = future.next;
            future.next = cur;

            pre = pre.next.next;
        }
        return dummy.next;
    }
}
```

