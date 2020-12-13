# jQuery is() 方法
## 定义和使用
is() 方法用于查看选择的元素是否匹配选择器。

## 语法
``` txt
$(selector).is(selectorElement,function(index,element))
```
参数	 | 描述 
:-: | :-: 
selectorElement | 必须。选择器表达式，根据选择器/元素/jQuery 对象检查匹配元素集合，如果存在至少一个匹配元素，则返回 true，否则返回 false 
function(index,element)	 | 可选。指定了选择元素组要执行的函数。 (1) index - 元素的索引位置     (2)  element - 当前元素 ( "this" 选择器也可以使用 )

## demo
```txt
如果 <p> 的父元素是 <div> 元素，弹出提示信息:
```


``` js
if ($("p").parent().is("div")) {
    alert("p 的父元素是 div");
}
```

# jQuery  attr() 方法
## 定义和使用
attr() 方法设置或返回被选元素的属性值。

根据该方法不同的参数，其工作方式也有所差异。
## 获取属性值
### 语法
``` txt
$(selector).attr(attribute)
```
参数	 | 描述 
:-: | :-: 
attribute	 | 规定要获取其值的属性。

## demo
```txt
获取img标签的width属性的值
```


``` js
$("img").attr("width")}
```
## 设置属性值
### 语法
``` txt
$(selector).attr(attribute,value)
```
参数	 | 描述 
:-: | :-: 
attribute	 | 规定要获取其值的属性。
value |规定属性的值。


## demo
```txt
设置img标签的width属性的值
```


``` js
$("img").attr("width","180");
```
## 设置多个属性值
### 语法
``` txt
$(selector).attr({attribute:value, attribute:value ...})

```
参数	 | 描述 
:-: | :-: 
attribute:value	 | 规定一个或多个属性/值对。

## 使用函数设置属性值
### 语法
``` txt
$(selector).attr(attribute,function(index,oldvalue))

```
参数	 | 描述 
:-: | :-: 
attribute	 | 规定要获取其值的属性。
function(index,oldvalue) |规定返回属性值的函数。该函数可接收并使用选择器的 index 值和当前属性值。


## demo
```txt
减少图像的宽度 50 像素
```


``` js
$("img").attr("width",function(n,v){
  return v-50;
});
```



# jQuery  :checked 选择器
## 定义和使用
:checked 选择器选取所有选中的复选框或单选按钮

## 语法
``` txt
$(":checked")
```

# jQuery 多个类 选择器
## 定义和使用
.class 选择器可用于选取多个 class。

- 注意：用逗号分隔每个 class。

- 注意：不要使用数字开头的 class 属性！在某些浏览器中可能出问题。

## 语法
``` txt
$(".class1,.class2,.class3,...")
```
参数	 | 描述 
:-: | :-: 
class	 | 必需。规定要选取的元素的 class。

## demo
```txt
选取 class 为 "intro"、"demo" 或 "end" 的所有元素：
```


``` js
$(".intro,.demo,.end")
```

# jQuery 属性操作 - val() 方法
## 定义和使用
val() 方法返回或设置被选元素的值。

元素的值是通过 value 属性设置的。该方法大多用于 input 元素。

如果该方法未设置参数，则返回被选元素的当前值。

## 语法
``` txt
$$(selector).val(value)
```
参数	 | 描述 
:-: | :-: 
value	 | 可选。规定被选元素的新内容。

## demo
```txt
选取 class 为 "intro"、"demo" 或 "end" 的所有元素：
```


``` js
$(".intro,.demo,.end")
```