# 概述
一般我们会在GitHub，gitlab这些平台创建我们的项目，如果我们已有的项目想要托管到这些平台，我们一般会在这些平台创建一个空的项目，再进行关联。

# 步骤
1. 在平台创建项目
2. 本地项目使用git init进行初始化生成.git文件夹
3. 使用git remote add origin 远程仓库地址命令关联远程仓库
4. 如果我们直接使用git branch --set-upstream-to=origin/master master关联本地和远程分支会报错
![image](https://img-blog.csdnimg.cn/20190226200627155.png)
5. 这时候我们使用pull命令是无效的，会报错：fatal: refusing to merge unrelated histories，此时两个仓库还未关联
6. 使用git pull origin master --allow-unrelated-histories命令拉去远程仓库，允许合并两个不相关仓库
7. git branch --set-upstream-to=origin/master master关联远程master分支到本地master分支
8. 此时已经成功关联本地与远程项目，可以正常使用git命令