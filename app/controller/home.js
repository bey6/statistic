const Controller = require('egg').Controller
const moment = require('moment')
const Req = require('../class/rep')
class HomeController extends Controller {
    async index() {
        try {
            let { total, list } = await this.ctx.service.package.search(this.ctx.request.query.page || 1)
            let pkgs = list.map((p) => ({ id: p.id, key: p.rn, name: p.name, contributor: p.owner, createTime: moment(p.createTime).format('YYYY-MM-DD hh:mm:ss'), description: p.description }))
            let pages = []

            let totalPage = Number.parseInt(total / 20)
            if (total % 20) totalPage++
            for (let p = 0; p < totalPage; p++) {
                pages.push(p + 1)
            }
            await this.ctx.render('home/index.html', { packages: pkgs, pages, page: (this.ctx.request.query.page || 1) - 0 })
        } catch (error) {
            await this.ctx.render('error/index.html', { msg: error.message })
        }
    }
}

module.exports = HomeController
