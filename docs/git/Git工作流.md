# 概述
Git工作流是指使用Git协调工作的一个流程，常用的Git工作流有四种，分别是：集中式工作流、功能分支工作流
、GitFlow 工作流、Forking 工作流。

Tips~
```
Pull Requests
Pull requests是发起一个合并请求，并且提供了图形化界面的讨论区，方便开发着讨论该代码是否符合规范。
```

# 集中式工作流
## 概述
 该工作流是四种工作流中最简单的，也是一种过渡式的工作流模式，工作流程和集中式的版本管理系统类似。
 以git仓库的master分支作为合作分支，每个成员都从master分支拉去和更新代码。
 
 ## 工作流程
 1. 由某个开发者在代码托管平台创建仓库并且上传代码
 2. 其他开发着拉去代码到本地（git clone）
 3. 每个开发者各自开发功能，测试稳定后，推送到远程master分支(git push)
 4. 在推送分支前先检查本地是master是否是远程库最新版本，若不是则先拉去远程库最新代码(git pull)
 5. 遇到冲突时协商好代码的取舍，合并好冲突后再推送到远程分支(pull-> add-> commit-> push)
 

## 解决冲突的方法
假设有两个开发者一同拉取了远程仓库master分支。
![image](https://s1.ax1x.com/2020/03/28/GAPD9f.png)

他们各自开发功能
![image](https://s1.ax1x.com/2020/03/28/GAP5CV.png)

小明推送功能到远程master（git push origin master）
此时远程master分支为

![image](https://s1.ax1x.com/2020/03/28/GAiibd.png)

此时小红的功能也写好了，当小红使用git push origin master时会推送失败，原因是远程master分支已经和小红本地分支有了差异

```
error: failed to push some refs to 'demo.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Merge the remote changes (e.g. 'git pull')
hint: before pushing again.
```

根据Git给我们的提示，我们要先进行拉取操作，也就是git pull，此时我们有两种做法，一种是直接使用git pull命令，另一种是使用git pull --rebase origin master命令合并（变基）解决冲突。

- 使用git pull直接解决冲突时只需要解决有冲突的文件，选择当前分支head部分或者远程分支部分或者综合
![image](https://s1.ax1x.com/2020/03/28/GAKwUU.png)
- 使用git pull --rebase origin master解决冲突时，分支会有以下改变
![image](https://s1.ax1x.com/2020/03/28/GAuqNF.png)
**使用--rebase之后会将当前的修改合并到pull下来的远程master上，相当于把小红的修改合并到小明的修改上**
- 当文件有冲突时，Git在合并有冲突的提交处暂停 rebase 过程，输出下面的信息并带上相关的指令：
```
CONFLICT (content): Merge conflict in
```
此时我们可以通过git status查看冲突文件,冲突文件列在 Unmerged paths中
```
# Unmerged paths:
# (use "git reset HEAD <some-file>..." to unstage)
# (use "git add/rm <some-file>..." as appropriate to mark resolution)
#
# both modified: <some-file>
```
小红解决完冲突后使用git add <some-file>就可以继续合并了，使用git rebase --continue持续合并，合并完所有提交后可以正常git push

我们也可以通过git rebase --abort丢弃所有合并，返回到git pull的状态

- 通常集中式工作流会使用git pull --rebase的方式，这样远程分支的提交记录就是一个完美的线性历史

# 功能分支工作流
## 概述
Git提供给我们的功能远比集中式工作流的要强，Git的分支功能极为强大，可以快速的创建分支、切换分支、合并分支，分支功能在集中式的工作流中几乎没有用到，而分支工作流则是运用这些强大功能的地方。Git鼓励开发者创建不同的分支进行工作。

## 工作流程
需求：小明开发登录功能，小红开发注册功能
1. 小明和小红分别基于master创建并切换分支feature_login、feature_register
2. 当小明和小红开发好功能后分别推送功能分支到远程
3. 发起pull request，由专门的成员进行代码审核（review），同意后进行合并，否则通知小明/小红进行修改
4. 合并成功后小明/小红拉取master代码，同时删除远程功能分支

![image](https://s1.ax1x.com/2020/03/28/GA8HMQ.png)


# GitFlow 工作流
## 概述
GitFlow 工作流定义了一个围绕项目发布的严格分支模型。虽然比功能分支工作流复杂几分，但提供了用于一个健壮的用于管理大型项目的框架。

GitFlow 工作流没有用超出功能分支工作流的概念和命令，而是为不同的分支分配一个很明确的角色，并定义分支之间如何和什么时候进行交互。除了使用功能分支，在做准备、维护和记录发布也使用各自的分支。当然你可以用上功能分支工作流所有的好处：Pull Requests、隔离实验性开发和更高效的协作。

## 几种分支的功能
- master：主分支，上线版本，只能允许预发布分支和hotfix合并到master，合并后用标签标记版本号
- release：预发布分支
- hotfix：热修复分支
- feature：功能分支
- develop：开发分支，当功能足够之后，从develop分支分出release


## 工作流程
1. 某个开发者基于master创建远程develop分支
2. 此时小明需要开发支付功能，小明必须先切换到develop分支，基于develop分支再创建feature_pay
3. 当小明开发好支付功能后提交feature_pay到远程，同时发起一个pull request | feature_pay->develop
4. 代码通过审核之后，合并到develop分支，合并完成后删除功能分支feature_pay
5. 当develop分支的功能到达一定阶段后，基于develop创建release-1.0.0分支
6. 测试人员对release-1.0.0分支进行测试，当测试通过后可以合并到master，并且打上标签1.0.0-RELEASE进行发布，若release版本有改动则合并会develop分支
7. 发布之后出现了bug，为了修复bug，开发者基于标签1.0.0-RELEASE创建分支hotfix_0001,bug修复完成后发起合并请求，测试通过后直接合并到master分支并创建标签1.0.1-RELEASE，此时再发布1.0.1-RELEASE版本
8. 完成新版本推送后，将hotfix合并到develop分支，删除hotfix分支、release分支（tag是会一直存在的，不允许修改）
![image](https://s1.ax1x.com/2020/03/29/GEmneK.png)

# 简化版的GitFlow工作流
省略feature分支，所有的功能在develop完成，把develop当成集中式工作流进行管理，其他分支仍然存在

# Forking 工作流
## 概述 
该工作流通常用于开源项目的使用，好处是可以公开代码给数量庞大的开发者而不用赋予所有开发者写库的权限，当社区开发者想要提交自己的功能时只需要从自己fork的仓库提交pull request即可，维护开源项目的开发人员审核通过后可合并到主库，并且公布贡献名单。

## 工作流程
1. 项目维护者初始化正式仓库
2. 社区开发者 fork 正式仓库
3. 开发者克隆自己 fork 出来的仓库，注意此时开发者有两个远程的仓库（一个是正式仓库，一个是自己fork的仓库）
4. 社区开发者关联正式仓库（git remote add upstream <正式仓库名> #这里的upstream是别名）
5. 社区开发者开发自己的功能
6. 开发者发布自己的功能到自己fork的库(发布前要拉取正式仓库的代码，git pull upstream master)
7. 发起pull request请求合并
8. 项目维护者集成开发者的功能(合并请求到正式库)
9. 因为正式代码库往前走了，其他开发者和正式仓库做同步(git pull upstream master)

# 总结
每种方式都有适用的范围，人数少的团队的可以使用集中式的工作流、功能分支工作流，人数多的团队可以使用Git-Flow工作流，人数特别多的可以使用Forking工作流。我们无需纠结使用哪种工作流，只要能保证我们代码被有效的管理即可。


