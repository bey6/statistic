const Controller = require('egg').Controller
const moment = require('moment')

class HomeController extends Controller {
    async index() {
        try {
            let { total, list } = await this.ctx.service.mrquery.search(
                this.ctx.request.query.page || 1,
                this.ctx.request.query.limit || 50
            )
            let pkgs = list.map((p) => ({
                id: p.id,
                key: p.rn,
                name: p.name,
                contributor: p.owner,
                createTime: moment(p.createTime).format('YYYY-MM-DD hh:mm:ss'),
                description: p.description,
            }))
            let pages = []

            let totalPage = Math.ceil(total / 50)
            for (let p = 0; p < totalPage; p++) {
                pages.push(p + 1)
            }
            let page = (this.ctx.request.query.page || 1) - 0,
                prevPage = page - 1 < 1 ? 1 : page - 1,
                nextPage = page + 1 > pages.length ? page : page + 1
            await this.ctx.render('home/index.html', {
                title: '查询包列表',
                packages: pkgs,
                pages,
                prevPage,
                page,
                nextPage,
            })
        } catch (error) {
            await this.ctx.render('error/index.html', { msg: error.message })
        }
    }
}

module.exports = HomeController
