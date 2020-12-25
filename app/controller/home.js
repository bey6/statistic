const Controller = require('egg').Controller

class HomeController extends Controller {
    async index() {
        await this.ctx.render('home/index.html', {
            message: '你你你你你你'
        })
    }
}

module.exports = HomeController