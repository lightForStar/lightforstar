# Fail-Fast和Fail-Safe

## Fail-Fast

### 概述

**fail-fast 机制是集合(Collection)中的一种错误机制。**当多个线程对同一个集合的内容进行操作时，就可能会产生fail-fast事件或单个线程在使用迭代器遍历同时改变了集合的结构。例如：当某一个线程A通过iterator去遍历某集合的过程中，若该集合的内容被其他线程所改变了；那么线程A访问集合时，就会抛出ConcurrentModificationException异常，产生fail-fast事件。

同时在ArrayList（jdk1.8的74行)中有这样的描述

```java
 * <p><a name="fail-fast">
 * The iterators returned by this class's {@link #iterator() iterator} and
 * {@link #listIterator(int) listIterator} methods are <em>fail-fast</em>:</a>
 * if the list is structurally modified at any time after the iterator is
 * created, in any way except through the iterator's own
 * {@link ListIterator#remove() remove} or
 * {@link ListIterator#add(Object) add} methods, the iterator will throw a
 * {@link ConcurrentModificationException}.  Thus, in the face of
 * concurrent modification, the iterator fails quickly and cleanly, rather
 * than risking arbitrary, non-deterministic behavior at an undetermined
 * time in the future.
 

 * <p>Note that the fail-fast behavior of an iterator cannot be guaranteed
 * as it is, generally speaking, impossible to make any hard guarantees in the
 * presence of unsynchronized concurrent modification.  Fail-fast iterators
 * throw {@code ConcurrentModificationException} on a best-effort basis.
 * Therefore, it would be wrong to write a program that depended on this
 * exception for its correctness:  <i>the fail-fast behavior of iterators
 * should be used only to detect bugs.</i>
```

大致的意思是说返回的iterator和listIterator是fail-fast机制的，如果使用了迭代器之外的修改结构（增加或删除元素）的方法则会抛出ConcurrentModificationException异常，因此，面对并发修改，迭代器会快速干净地失败，而不是冒着在未来不确定的时间冒任意，不确定行为的风险。第二段是告诉我们fast-fail机制并不是一定会发生的，不能使用这种机制应对并发问题。那么在什么时候不发生呢？分析后揭晓

### 多线程案例

1. 使用ArrayList的remove方法

```java
public class FailFastTest {
    public static ArrayList<Integer> arrayList = new ArrayList<>();

    public static void init(){
        for (int i=0;i<10;i++){
            arrayList.add(i);
        }
    }


    private static class MyThread extends Thread{

        @Override
        public void run() {
            Iterator<Integer> iterator = arrayList.iterator();
            System.out.println(iterator);
            while (iterator.hasNext()){
                System.out.println(iterator.next());
                try {
                    //等待MyThread1线程执行
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private static class MyThread1 extends Thread{

        @Override
        public void run() {
            try {
                //保证MyThread先运行
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            for (int i = 0;i<arrayList.size();i++){
                if (i==3)
                    arrayList.remove(i);

            }
        }
    }


	    public static void main(String[] args) {
            init();
            MyThread myThread = new MyThread();
            myThread.setName("T-1");

            MyThread1 myThread1 = new MyThread1();
            myThread.setName("T-2");
            myThread.start();
            myThread1.start();
    }
}
```

运行上面的程序后会出现下面的现象

```txt
Exception in thread "T-2" java.util.ConcurrentModificationException
	at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:909)
	at java.util.ArrayList$Itr.next(ArrayList.java:859)
	at com.zgg.FailFastTest$MyThread.run(FailFastTest.java:23)
```

2. 使用迭代器的remove方法

```java
public class FailFastTest {
    public static ArrayList<Integer> arrayList = new ArrayList<>();

    public static void init(){
        for (int i=0;i<10;i++){
            arrayList.add(i);
        }
    }


    private static class MyThread extends Thread{

        @Override
        public void run() {
            Iterator<Integer> iterator = arrayList.iterator();
            System.out.println(iterator);
            while (iterator.hasNext()){
                System.out.println(iterator.next());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private static class MyThread2 extends Thread{

        @Override
        public void run() {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            Iterator<Integer> iterator = arrayList.iterator();
            while (iterator.hasNext()){
                if (iterator.next() == 3)
                    iterator.remove();
            }

        }
    }



    public static void main(String[] args) {
        init();
        MyThread myThread = new MyThread();
        myThread.setName("T-1");

        MyThread2 myThread2 = new MyThread2();
        myThread.setName("T-2");
        myThread.start();
        myThread2.start();
    }
}
```

运行后出现下面的现象

```java
Exception in thread "T-2" java.util.ConcurrentModificationException
	at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:909)
	at java.util.ArrayList$Itr.next(ArrayList.java:859)
	at com.zgg.FailFastTest$MyThread.run(FailFastTest.java:23)
```

3. 根据上面两个案例我们可以得出如果并发修改了ArrayList的结构，那么使用iterator进行遍历时会触发fail-fast机制，抛出ConcurrentModificationException

### 单线程案例

```java
    public static void main(String[] args) {
        ArrayList<Integer> list = new ArrayList<>();
        for(int i=0;i<10;i++)
            list.add(i);
        Iterator<Integer> iterator = list.iterator();
        while (iterator.hasNext()){
            System.out.println(iterator.next());
            if (iterator.next() == 3)
                list.remove(3);
        }

    }
```

运行结果

```java
0
2
Exception in thread "main" java.util.ConcurrentModificationException
	at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:909)
	at java.util.ArrayList$Itr.next(ArrayList.java:859)
	at com.zgg.FailFastTest.main(FailFastTest.java:122)
```

当我们使用iterator进行遍历时，用集合本身的remove方法删除元素会抛出ConcurrentModificationException异常

### 原理探究

根据我们上面的报错，进入到Itr的next方法

```java
        @SuppressWarnings("unchecked")
        public E next() {
            checkForComodification();
            int i = cursor;
            if (i >= size)
                throw new NoSuchElementException();
            Object[] elementData = ArrayList.this.elementData;
            if (i >= elementData.length)
                throw new ConcurrentModificationException();
            cursor = i + 1;
            return (E) elementData[lastRet = i];
        }
```

我们可以看到在next之前会调用checkForComodification();方法验证，进一步探究

```java
        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
```

我们可以看到里面出现了两个变量modCount和expectedModCount，这两个变量在哪里定义的？

查找AbstractList的源码，我们找到以下内容

```java
    /**
     * The number of times this list has been <i>structurally modified</i>.
     * Structural modifications are those that change the size of the
     * list, or otherwise perturb it in such a fashion that iterations in
     * progress may yield incorrect results.
     *
     * <p>This field is used by the iterator and list iterator implementation
     * returned by the {@code iterator} and {@code listIterator} methods.
     * If the value of this field changes unexpectedly, the iterator (or list
     * iterator) will throw a {@code ConcurrentModificationException} in
     * response to the {@code next}, {@code remove}, {@code previous},
     * {@code set} or {@code add} operations.  This provides
     * <i>fail-fast</i> behavior, rather than non-deterministic behavior in
     * the face of concurrent modification during iteration.
     *
     * <p><b>Use of this field by subclasses is optional.</b> If a subclass
     * wishes to provide fail-fast iterators (and list iterators), then it
     * merely has to increment this field in its {@code add(int, E)} and
     * {@code remove(int)} methods (and any other methods that it overrides
     * that result in structural modifications to the list).  A single call to
     * {@code add(int, E)} or {@code remove(int)} must add no more than
     * one to this field, or the iterators (and list iterators) will throw
     * bogus {@code ConcurrentModificationExceptions}.  If an implementation
     * does not wish to provide fail-fast iterators, this field may be
     * ignored.
     */
    protected transient int modCount = 0;
```

我们可以看到modCount是ArrayList的内部成员，在使用集合的add(int, E)、remove(int)会被改变，并且在迭代器中使用，这里就不分析内部类Itr的代码了，给出结果，迭代器在调用next方法时会检查modCount和expectedModCount是否相等，迭代器内部的set(ListItr)、add(ListItr)、remove操作会进行expectedModCount = modCount赋值，这里可以解答上面的fail-fast不能保证并发问题的答案了，如果我们修改后刚好到最后一个元素，此时不调用next方法就不会抛出异常。



接下来查看expectedModCount的声明，在ArrayList的内部类Itr中

```java
int expectedModCount = modCount;
```

通过上面的源码分析，我们可以看到，如果使用了集合自带的add和remove方法会改变modCount的值，在进行迭代器遍历的同时会检查这两个值是否相等，如果不相等就会报错，这也是为了防止不可预期的遍历顺序发生。

### 如何避免

单线程情况下只要在遍历时不使用集合本身的add和remove方法即可，或者使用普通for循环

多线程情况下得考虑并发问题可以使用并发容器如：Vector、ConcurrentHashMap以及java.util.concurrent包下的其他容器，还可以使用Collections.synchronizedList等方法加上synchronized锁



## Fail-Safe

### 概述

在遍历时不是直接在集合内容上访问的,而是先copy原有集合内容,在拷贝的集合上进行遍历，这样就解决了抛出

ConcurrentModificationException异常的问题，但是会带来额外的空间开销

### 缺点

- 空间开销大
- 无法保证读取到的数据具有一致性，原容器新增数据，之前copy的容器中不存在

### 优点

- 解决抛出异常问题

  

