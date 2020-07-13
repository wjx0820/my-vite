const { readBody } = require('./utils')
const { parse } = require('es-module-lexer') // 解析 import 语法
const MagicString = require('magic-string') // 因为字符串具有不变性，所以需要将字符串转为对象，修改后再返回

function rewriteImports(source) {
	console.log(source)
	let imports = parse(source)[0]
	let magicString = new MagicString(source)
	if (imports.length) {
		//说明有多条 import 语句
		for (let i = 0; i < imports.length; i++) {
			let { s, e } = imports[i]
			let id = source.substring(s, e) // vue ./App
			// 开头不为/或. 才需要重写
			if (/^[^\/\.]/.test(id)) {
				id = `/@modules/${id}`
				magicString.overwrite(s, e, id)
			}
		}
	}
	return magicString.toString()
}

function moduleRewritePlugin({ app, root }) {
	app.use(async (ctx, next) => {
		await next()
		// 洋葱模型

		// ctx.body 是流数据，转为字符串
		if (ctx.body && ctx.response.is('js')) {
			let content = await readBody(ctx.body)
			console.log(content)
			// 重写内容，将重写后的结果返回
			const result = rewriteImports(content)
			ctx.body = result
		}
	})
}

exports.moduleRewritePlugin = moduleRewritePlugin
