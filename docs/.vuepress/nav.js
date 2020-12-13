module.exports = [
	{
		text: '后台',
		items: [

			{
				text: 'Redis系列', items: [
					{ text: 'Redis理论', link: '/back/Redis理论/' },
					{ text: 'Redis实战', link: '/back/Redis实战/' },
				]
			},
			{
				text: 'springboot', items: [
					{ text: 'springboot整合log4j2', link: '/back/springboot整合log4j2搭建日志系统/' },
					{ text: 'springboot整合Mybatis', link: '/back/springboot整合Mybatis/' },
					{ text: 'springboot整合freemaker', link: '/back/springboot整合freemaker/' },
					{ text: '自动装配发展历程', link: '/back/自动装配发展历程/' },
				]
			},
			{
				text: '安全系列', items: [
					{ text: 'Shiro', link: '/back/Shiro/' },
					{ text: 'JWT', link: '/back/JWT/' },
					{ text: 'SQL注入', link: '/back/SQL注入/' },
				]
			},
		]
	},
	{
		text: '前端',
		items: [
			{ text: 'aaa', link: 'https://www.baidu.com/' },

			{ text: 'jsp自定义标签', link: '/front/jsp自定义标签/' },
			{ text: 'wangEditor富文本编辑器', link: '/front/wangEditor富文本编辑器/' },
			{ text: '图片上传插件Dropzone', link: '/front/图片上传插件Dropzone使用/' },
		]
	},
	{
		text: '算法',
		items: [
			{
				text: '排序篇', items: [
					{ text: '冒泡排序', link: '/sort/冒泡排序/' },
					{ text: '选择排序', link: '/sort/选择排序/' },
					{ text: '插入排序', link: '/sort/插入排序/' },
					{ text: '希尔排序', link: '/sort/希尔排序/' },
					{ text: '归并排序', link: '/sort/归并排序/' },
					{ text: '快速排序', link: '/sort/快速排序/' },
				]
			},
		]
	},
	{
		text: '未归类',
		items: [
			{ text: 'Spring', link: '/back/Spring/' },
			{ text: '计算机网络', link: '/back/计算机网络/' },
			{ text: '设计模式', link: '/back/设计模式/' },
			{ text: 'mybatis批量操作', link: '/back/mybatis批量操作/' },
			{ text: '后台curd架构封装', link: '/back/架构演变之封装curd操作（spring泛型依赖注入的使用）/' },
			{ text: 'nigix配置静态资源访问', link: '/back/nigix配置静态资源访问/' },
			{ text: 'HashMap源码分析', link: '/back/HashMap源码分析/' },
			{ text: 'Fail-Fast和Fail-Safe', link: '/back/Fail-Fast和Fail-Safe/' },
			{ text: '服务器CPU利用率100%排查', link: '/back/服务器CPU利用率100%排查/' },
		]
	},
	{
		text: '工具篇',
		items: [
			{
				text: 'Git', 
				items: [
					{ text: 'Git常用命令', link: '/git/Git常用命令/' },
					{ text: 'Git工作流', link: '/git/Git工作流/' },
					{ text: 'Git关联已有的远程仓库', link: '/git/git关联已有的远程仓库/' },
				]
			}

		]
	},
	{
		text: '工具箱',
		items: [
			{
				text: '在线编辑',
				items: [
					{ text: '图片压缩', link: 'https://tinypng.com/' }
				]
			},
			{
				text: '在线服务',
				items: [
					{ text: '阿里云', link: 'https://www.aliyun.com/' },
					{ text: '腾讯云', link: 'https://cloud.tencent.com/' }
				]
			},
			{
				text: '博客指南',
				items: [
					{ text: '掘金', link: 'https://juejin.im/' },
					{ text: 'CSDN', link: 'https://blog.csdn.net/' }
				]
			}
		]
	}
]