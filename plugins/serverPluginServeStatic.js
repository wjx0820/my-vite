const static = require('koa-static')
const path = require('path')

function serveStaticPlugin({ app, root }) {
	// 以 vite 运行的路径启动静态服务
	app.use(static(root))
	// public 也作为静态服务
	app.use(static(path.join(root, 'public')))
}

exports.serveStaticPlugin = serveStaticPlugin
