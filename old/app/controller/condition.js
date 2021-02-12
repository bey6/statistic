const { Controller } = require('egg')

class ConditionController extends Controller {
    async index() {
        await this.ctx.render('condition/index.html', {
            title: '条件项配置',
        })
    }
}

module.exports = ConditionController
