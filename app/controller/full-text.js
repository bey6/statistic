const Controller = require('egg').Controller

class FullTextController extends Controller {
    async index() {
        const list = await this.ctx.service.es.getPatientByName(this.ctx.query.keywords)
        if (list) await this.ctx.render('query/index.html', { list: list.map(d => d._source) })
        this.ctx.body = {
            code: 200,
            msg: '无结果'
        }
    }
}

module.exports = FullTextController