
module.exports = {
    title: 'lightForStar',
    description: 'lightForStar的个人博客',
    dest: './dist',
    port: '7777',
	base: '/dist/',
    head: [
        ['link', {rel: 'icon', href: '/images/logo.jpeg'}]
    ],
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        nav: require('./nav'),
        sidebar: 'auto',
        sidebarDepth: 2,
		// 默认值是 true 。设置为 false 来禁用所有页面的 下一篇 链接
		nextLinks: true,
		// 默认值是 true 。设置为 false 来禁用所有页面的 上一篇 链接
		prevLinks: true,
        lastUpdated: 'Last Updated',
        searchMaxSuggestoins: 10,
        serviceWorker: {
            updatePopup: {
                message: "有新的内容.",
                buttonText: '更新'
            }
        },
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页 ！'
    }
}