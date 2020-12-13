# 介绍
```txt
Datatables是一款jquery表格插件。它是一个高度灵活的工具，可以将任何HTML表格添加高级的交互功能。

分页，即时搜索和排序
几乎支持任何数据源：DOM， javascript， Ajax 和 服务器处理
支持不同主题 DataTables, jQuery UI, Bootstrap, Foundation
各式各样的扩展: Editor, TableTools, FixedColumns ……
丰富多样的option和强大的API
支持国际化
```





# 引入资源文件
```js
<!--第一步：引入Javascript / CSS （CDN）-->
<!-- DataTables CSS -->
<link rel="stylesheet" type="text/css" href="http://cdn.datatables.net/1.10.15/css/jquery.dataTables.css">
 
<!-- jQuery -->
<script type="text/javascript" charset="utf8" src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
 
<!-- DataTables -->
<script type="text/javascript" charset="utf8" src="http://cdn.datatables.net/1.10.15/js/jquery.dataTables.js"></script>
 
 
<!--或者下载到本地，下面有下载地址-->
<!-- DataTables CSS -->
<link rel="stylesheet" type="text/css" href="DataTables-1.10.15/media/css/jquery.dataTables.css">
 
<!-- jQuery -->
<script type="text/javascript" charset="utf8" src="DataTables-1.10.15/media/js/jquery.js"></script>
 
<!-- DataTables -->
<script type="text/javascript" charset="utf8" src="DataTables-1.10.15/media/js/jquery.dataTables.js"></script>
```

# 创建表单
```html
<!--第二步：添加如下 HTML 代码-->
<table id="table_id_example" class="display">
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Row 1 Data 1</td>
            <td>Row 1 Data 2</td>
        </tr>
        <tr>
            <td>Row 2 Data 1</td>
            <td>Row 2 Data 2</td>
        </tr>
    </tbody>
</table>
 ```
 
 # 初始化数据表格
 ```js
 <!--第三步：初始化Datatables-->
$(document).ready( function () {
    $('#table_id_example').DataTable();
} );
```

# 开启服务器模式，异步请求获取数据
- 数据量在5w条以内可以使用客户端模式（即把数据返回给浏览器，浏览器进行分页）

## 启用服务器模式
```js
//example为表格的id
$('#example').dataTable( {
  "serverSide": true,
  "ajax": "/user"
} );
```

## 服务器模式自动携带的参数
![image](https://s2.ax1x.com/2020/01/23/1VBg8H.png)

## 后台返回给前端的参数
![image](https://s2.ax1x.com/2020/01/23/1Vrx4U.png)

[具体文档](http://datatables.club/manual/server-side.html)

## 指定异步请求数据源与表格每一列的对应关系
```js
$('#example').dataTable( {
    //data是具体填充的数据，开启服务器模式后回备覆盖掉
    "data": [
        {
            "name":       "Tiger Nixon",
            "position":   "System Architect",
            "salary":     "$3,120",
            "start_date": "2011/04/25",
            "office":     "Edinburgh",
            "extn":       5421
        },
        {
            "name": "Garrett Winters",
            "position": "Director",
            "salary": "5300",
            "start_date": "2011/07/25",
            "office": "Edinburgh",
            "extn": "8422"
        },
        // ...
    ],
    //columns是指定列的顺序
    "columns": [
        { "data": "name" },
        { "data": "position" },
        { "data": "office" },
        { "data": "extn" },
        { "data": "start_date" },
        { "data": "salary" }
    ]
} );
```
[具体文档](http://datatables.club/reference/option/data.html)
## 国际化
dataTable默认使用英文

- 配置中文
```js
$('#example').DataTable({
    language: {
        "sProcessing": "处理中...",
        "sLengthMenu": "显示 _MENU_ 项结果",
        "sZeroRecords": "没有匹配结果",
        "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
        "sInfoPostFix": "",
        "sSearch": "搜索:",
        "sUrl": "",
        "sEmptyTable": "表中数据为空",
        "sLoadingRecords": "载入中...",
        "sInfoThousands": ",",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页"
        },
        "oAria": {
            "sSortAscending": ": 以升序排列此列",
            "sSortDescending": ": 以降序排列此列"
        }
    }
});
```

## 动态传参进行重载（搜索功能）
```js
//初始化表格
var oTable = $("#example").DataTable({
    ajax: {
        url: "dataList.action"
    }
});
 
//当你需要多条件查询，你可以调用此方法，动态修改参数传给服务器
function reloadTable() {
    var name = $("#seName").val();
    var admin = $("#seAdmin").val();
    var param = {
        "name": name,
        "admin": admin
    };
    oTable.settings()[0].ajax.data = param;
    oTable.ajax.reload();
}
```

[文档](http://datatables.club/reference/option/ajax.data.html)


## 如何处理特殊的列（例如选择框、操作按钮）
 - 在指定数据源与每一列的对应关系时可以使用函数返回html标签或者经过处理的数据
 
```js
$('#example').dataTable( {
    //columns是指定列的顺序
    "columns":[
           {    //指定返回选择框  row中包含每一行的数据，可以通过.操作符获取
               "data": function (row, type, val, meta) {
                   return '<input type="checkbox" class="minimal" id="'+row.id+'" />';
               }
           },
           {"data": "id"},
           {"data": "username"},
           {"data": "phone"},
           {"data": "email"},
           {"data": "updated"},
           {    //返回三个按钮
               "data": function (row, type, val, meta) {
                   var detailUrl = "/user/detail?id=" + row.id;
                   var deleteUrl = "/user/delete";
                   return '<button type="button" class="btn btn-sm btn-default" onclick="App.handleUserDetail(\'' + detailUrl + '\');"><i class="fa fa-search"></i> 查看</button>&nbsp;&nbsp;&nbsp;' +
                       '<a href="/user/form?id=' + row.id + '" type="button" class="btn btn-sm btn-primary"><i class="fa fa-edit"></i> 编辑</a>&nbsp;&nbsp;&nbsp;' +
                       '<button type="button" class="btn btn-sm btn-danger" onclick="App.deleteSingle(\'' + deleteUrl + '\', \'' + row.id + '\')"><i class="fa fa-trash-o"></i> 删除</button>';

               }
           }
       ];
} );
```
[文档](https://datatables.net/reference/option/columns.data)