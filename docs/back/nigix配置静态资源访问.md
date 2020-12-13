## 配置文件
![avateur](http://47.107.102.132:8099/images/nigix-config.jpg)
增加一个location配置额外的访问路径

图片中的/images就是配置访问路径，例如你的nigix端口是8099，访问/usr/blog-images下的a.jpg那么完整的访问路径为ip/images/a.jpg;

location的作用就是将访问路径映射到具体的资源文件夹;

root与alias的区别

root的访问路径会在配置的访问路径基础上加上文件夹，例如图中的第一个location，配置了/映射到html文件夹，那么访问路径为ip/html

alias则是将访问路径直接映射到文件夹，如第二个location，/images直接映射到/usr/blog-images文件夹中，那么访问路径为ip/images