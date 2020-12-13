# 介绍
```txt
DropzoneJS是一个开源库，提供带有图像预览的拖放文件上传。
它是轻量级的，不依赖于任何其他库（如jQuery），并且高度可定制。
```
- 官网：https://www.dropzonejs.com/

# 使用
## 引入css和js
```js
    //上传图片的插件,css是官网的效果，官网上有demo
    <link rel="stylesheet" href="/static/asserts/plugins/dropzone/min/basic.min.css" />
    <link rel="stylesheet" href="/static/asserts/plugins/dropzone/min/dropzone.min.css" />
    <script src="/static/asserts/plugins/dropzone/dropzone.js"></script>
```

## 初始化
- 官网提供了多种初始化的方法，这里只演示一种


只需要引入下列的html和js代码就可以进行使用
```html
    <div class="form-group">
        <label for="pic" class="col-sm-2 control-label">图片1</label>

        <div class="col-sm-10">
            <form:input cssClass="form-control required" path="pic"
                        placeholder="请选择图片" readonly="true"/>
            <div id="upload1" class="dropzone"></div>
        </div>
    </div>
```
- 注意不要将代码放在在jQuery初始化的方法体内
```js
//关闭Dropzone的自动发现功能
    Dropzone.autoDiscover = false;
    var myDropzone = new Dropzone("#upload1", {
        url: "/uploadPic",
        dictDefaultMessage: '拖动文件至此或者点击上传', // 设置默认的提示语句
        paramName: "file", // 传到后台的参数名称
        init: function () {
            this.on("success", function (file, data) {
                if (data.status === 200){
                    $("#pic").val(data.data)
                }
                console.log(file);
                console.log(data);
                // 上传成功触发的事件
            });
        }
    });
```

## 异步上传成功后可返回图片路径
- 调用this.on方法可以获得服务器端返回的结果

## 常用参数
```js
    var defaultDropzoneSetting = {
        url: "", // 文件提交地址
        method: "post",  // 也可用put
        paramName: "file", // 默认为file
        maxFiles: 1,// 一次性上传的文件数量上限
        maxFilesize: 2, // 文件大小，单位：MB
        acceptedFiles: ".jpg,.gif,.png,.jpeg", // 上传的类型
        addRemoveLinks: true,
        parallelUploads: 1,// 一次上传的文件数量
        dictDefaultMessage: '拖动文件至此或者点击上传',
        dictMaxFilesExceeded: "您最多只能上传"+this.maxFiles+"个文件！",
        dictResponseError: '文件上传失败!',
        dictInvalidFileType: "文件类型只能是*.jpg,*.gif,*.png,*.jpeg。",
        dictFallbackMessage: "浏览器不受支持",
        dictFileTooBig: "文件过大上传文件最大支持.",
        dictRemoveLinks: "删除",
        dictCancelUpload: "取消",
    };
```

效果图：
![image](https://s2.ax1x.com/2020/01/30/11Zu6K.png)