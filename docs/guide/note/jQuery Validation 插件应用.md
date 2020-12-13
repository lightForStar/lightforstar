# 什么是jQuery Validation Plugin？
```txt
    jQuery Validate 是基于jQuery编写的表单验证插件插件，让客户端表单验证变得更简单。
```
- 官网：https://jqueryvalidation.org
- 插件使用的参考文档：https://jqueryvalidation.org/reference

# 使用
1.引入jQuery的js文件
```js
<!-- jQuery 3 -->
<script src="/static/asserts/bower_components/jquery/dist/jquery.min.js"></script>
```
2.引入jQuery Validate的js文件
```js
<%--jQuery Validation Plugin - v1.14.0--%>
<script src="/static/asserts/plugins/jquery-validation/js/jquery.validate.min.js"></script>
```
3.引入jQuery Validate的国际化支持js文件
```js
<script src="/static/asserts/plugins/jquery-validation/js/localization/messages_zh.min.js"></script>
```

4.引入jQuery Validate添加自定义验证规则的js
```js
<script src="/static/asserts/plugins/jquery-validation/js/additional-methods.min.js"></script>
```

# 注意事项
注意事项：
1. 所有需要被校验的<input>元素都必须有 name 属性，并且其取值在一个表单中必须唯一。
2. 同组的<radio>或<checkbox>元素 name 属性值相同。、
3. 复杂的 name 属性在定义 rules 选项时需要使用 "" 括起来。
# demo
- 开启验证

```js
    <script>
        $(function () {
            $("#inputForm").validate({

            });
        })
    </script>
```

- 添加自定义验证的class

```js
    <script>
        $(function () {
            $.validator.addMethod("mobile", function (value, element) {
                var length = value.length;
                var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
                return this.optional(element) || (length == 11 && mobile.test(value));
            }, "请正确填写您的手机号码");



            $("#inputForm").validate({

            });
        })
    </script>
```