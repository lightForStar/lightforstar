# 介绍
zTree 是一个依靠 jQuery 实现的多功能 “树插件”。优异的性能、灵活的配置、多种功能的组合是 zTree 最大优点。

开发者可以用zTree展示树形数据，特别是种类的展示
- 官网： http://www.treejs.cn/v3/main.php#_zTreeInfo

# 使用
## 引入资源文件
```js
  <link rel="stylesheet" href="zTreeStyle/zTreeStyle.css" type="text/css">
  <script type="text/javascript" src="jquery-1.4.2.js"></script>
  <script type="text/javascript" src="jquery.ztree.core-3.x.js"></script>
```

## 初始化

html代码
```html
   <ul id="tree" class="ztree"></ul>
```
js代码
```js
    var setting = {
        view: {
            dblClickExpand: true, //双击展开
            showLine: true,
            selectedMulti: false
        },
        //开启异步获取树形数据每一个父节点下的数据
        async: {
            enable: true,
            url: url,
            autoParam: autoParam //自动会传递的数据，一般传递的是记录的id,第一次请求不会带
        }
    };

    //初始化指定id的表格
    $.fn.zTree.init($("#tree"), setting);
```

- 服务端只需要提供一个根据父id查询所有子节点的接口即可。


效果图

![image](https://s2.ax1x.com/2020/01/30/111g3Q.png)