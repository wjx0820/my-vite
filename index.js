const Koa = require('koa')
const { serveStaticPlugin } = require('./plugins/serverPluginServeStatic')

function createServer() {
	const app = new Koa()
	// 拿到vite运行的工作目录
	const root = process.cwd()

	console.log(root)

	const context = {
		app,
		root,
	}

	// 插件的集合
	const resolvedPlugins = [
		// 2) 解析 import 语法，进行重写

		// 1) 静态服务
		serveStaticPlugin,
	]

	resolvedPlugins.forEach((plugin) => plugin(context))

	return app
}

module.exports = createServer
