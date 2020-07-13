const moduleREG = /^\/@modules\//
const fs = require('fs').promises
const path = require('path')

function resolveVue(root) {
	// vue 由几部分组成 runtime-dom runtime-core complier-sfc reactivity shared...
	// complier-sfc 在后端中解析.vue 文件

	// 编译在后端实现的，所以需要拿到的文件是 commonjs 规范的
	// package.json 中 main 对应 commonjs 规范
	const compilerPkgPath = path.join(
		root,
		'node_modules',
		'@vue/compiler-sfc/package.json'
	)
	const compilerPkg = require(compilerPkgPath) // package.json 中的内容
	// node_modules/@vue/compiler-sfc/dist/compiler-sfc.cjs.js
	const compilerPath = path.join(
		path.dirname(compilerPkgPath),
		compilerPkg.main
	)

	// esmodule 规范
	const resolvePath = (name) =>
		path.resolve(
			root,
			'node_modules',
			`@vue/${name}/dist/${name}.esm-bundler.js`
		)

	const runtimeDomPath = resolvePath('runtime-dom')
	const runtimeCorePath = resolvePath('runtime-core')
	const reactivityPath = resolvePath('reactivity')
	const sharedPath = resolvePath('shared')

	return {
		compiler: compilerPath, // 稍后后端用来进行编译的文件路径
		'@vue/runtime-dom': runtimeDomPath,
		'@vue/runtime-core': runtimeCorePath,
		'@vue/reactivity': reactivityPath,
		'@vue/shared': sharedPath,
		vue: runtimeDomPath,
	}
}

function moduleResolvePlugin({ app, root }) {
	// 根据当前运行 vite 的目录解析出一个文件表来，包含 vue 中所有的模块
	const vueResolved = resolveVue(root)

	app.use(async (ctx, next) => {
		// 非/@modules/开头的
		if (!moduleREG.test(ctx.path)) {
			return next()
		}

		// 去掉前缀/@modules/
		const id = ctx.path.replace(moduleREG, '') // /@modules/vue ==> vue

		ctx.type = 'js' //设置响应类型
		// 去当前项目下查找 vue 对应的真实文件
		const content = await fs.readFile(vueResolved[id], 'utf8')
		ctx.body = content
	})
}

exports.moduleResolvePlugin = moduleResolvePlugin
