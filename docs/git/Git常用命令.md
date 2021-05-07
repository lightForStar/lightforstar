# Git常用命令

## 普通操作

1. 在已存在目录中初始化仓库
```
git init
```
2. 克隆现有的仓库
```
git clone <url>
```
3. 检查当前文件状态
```
git status
```
3. 跟踪新文件（添加文件到暂存区）

```
git add <filename>(git add命令使用文件或目录的路径作为参数；如果参数是目录的路径，该命令将递归地跟踪该目录下的所有文件。)
```
4. 提交更新

```
git commit -m "提交信息"
```
5. 移除文件(从暂存区域移除,连带从工作目录中删除指定的文件)
```
# 如果要删除之前修改过或已经放到暂存区的文件，则必须使用强制删除选项 -f
git rm <filename>
```
6. 文件保留在磁盘，但是并不想让 Git 继续跟踪
```
# 如果要删除之前修改过或已经放到暂存区的文件，则必须使用强制删除选项 -f
git rm --cached <filename>
```
7. 移动文件
```
git mv file_from file_to
```
8. 查看提交历史
```
git log
```

## 远程仓库的使用

1. 查看远程仓库
```
git remote 
```
2. 添加远程仓库（shortname是url的别名）
```
git remote add <shortname> <url> 
```
3. 从远程仓库中抓取与拉取数据
```
git fetch <remote>

# 这个命令会访问远程仓库，从中拉取所有你还没有的数据。 执行完成后，你将会拥有那个远程仓库中所有分支的引用，可以随时合并或查看。

# 说明
如果你使用 clone 命令克隆了一个仓库，命令会自动将其添加为远程仓库并默认以 “origin” 为简写。 
所以，git fetch origin 会抓取克隆（或上一次抓取）后新推送的所有工作。 

必须注意 git fetch 命令只会将数据下载到你的本地仓库——它并不会自动合并或修改你当前的工作。
当准备好时你必须手动将其合并入你的工作。
```
4. 推送到远程仓库
```
git push <remote> <branch>
# 要将 master 分支推送到 origin 服务器时（再次说明，克隆时通常会自动帮你设置好那两个名字）
git push origin master

# 说明
只有当你有所克隆服务器的写入权限，并且之前没有人推送过时，这条命令才能生效。
当你和其他人在同一时间克隆，他们先推送到上游然后你再推送到上游，你的推送就会毫无疑问地被拒绝。
你必须先抓取他们的工作并将其合并进你的工作后才能推送。
```
5. 查看某个远程仓库
```
git remote show <remote>
```
6. 远程仓库的重命名
```
# 将 pb 重命名为 paul
git remote rename pb paul
```
7. 远程仓库的删除
```
git remote remove <remote>
```
## 分支管理

1. 查看前所有分支的一个列表：
```
git branch
```

2. 查看前已合并/未合并列表：
```
git branch --merged(git branch --no-merged)
```

3. 查看各个分支当前所指的对象
```
git log --oneline --decorate
```


4. 创建分支（创建一个 testing 分支）
```
git branch testing
```

5. 切换分支（切换到 testing 分支，切换之前记得提交已修改文件（commit））
```
git checkout testing
```

6. 创建并切换分支
```
git checkout -b <newbranchname>
```

7. 合并分支
```
 假设你切换到testing分支，并且作了改变，想把改变合并到master分支
 1.先使用git checkout master切换到master分支
 2.使用git merge testing合并testing分支到master分支
```

8. 删除远程分支

```txt
git push origin --delete <远程分支名称>
```

9. 选取某个分支的最新提交合并到某个分支

```txt
假设你切换到testing分支，并且作了改变，想把改变合并到master分支
 1.先使用git checkout master切换到master分支
 2.使用git cherry-pick testing分支的最新提交合并testing分支到master分支
```

