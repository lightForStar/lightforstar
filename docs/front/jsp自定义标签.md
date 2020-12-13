# tag文件引入jsp模式
- 此方法可动态设置页面上按钮，选择框等html各种元素

## demo
## 1、在/WEB-INF/tags/sys目录下新建modal.tag
- modal.tag的内容，注意头部的声明，maven也要引入jstl依赖
```jsp
<%@ tag language="java" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
//相当于函数传参
<%@ attribute name="message" required="true" type="java.lang.String" description="提示框的提示信息" %>

<div class="modal fade" id="modal-default">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">温馨提示</h4>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default pull-left" data-dismiss="modal">关闭</button>
                <button type="button" class="btn btn-primary my-contern">确定</button>
            </div>
        </div>
        <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
</div>
```



## 2、在jsp页面引用
```txt
jsp页面引用如下：

<%@ taglib prefix="sys" tagdir="/WEB-INF/tags/sys" %>

将modal.tag文件放在/WEB-INF/tags/sys文件夹下即可，引用时如下

//modal为对应的文件

<sys:modal/>
```