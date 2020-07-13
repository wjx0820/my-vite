const Koa = require('koa')
const { serveStaticPlugin } = require('./plugins/serverPluginServeStatic')
const { moduleRewritePlugin } = require('./plugins/serverPluginModuleRewrite')
const { moduleResolvePlugin } = require('./plugins/serverPluginModuleResolve')
const { htmlRewritePlugin } = require('./plugins/serverPluginHtml')
const { vuePlugin } = require('./plugins/serverPluginVue')

function createServer() {
	const app = new Koa()
	// 拿到vite运行的工作目录
	const root = process.cwd()

	const context = {
		app,
		root,
	}

	// 插件的集合
	const resolvedPlugins = [
		htmlRewritePlugin,
		// 2) 解析 import 语法，进行重写
		moduleRewritePlugin,

		// 3) 解析 /@modules/ 开头的内容，进行处理
		moduleResolvePlugin,

		vuePlugin,

		// 1) 静态服务
		// 读取的文件结果放到了 ctx.body 上
		serveStaticPlugin,
	]

	resolvedPlugins.forEach((plugin) => plugin(context))

	return app
}

module.exports = createServer
