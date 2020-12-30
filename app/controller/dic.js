const { Controller } = require('egg')
const dicCondition = require('../dic/dic_conditions')
const Rep = require('../class/rep')

class DicController extends Controller {
    async conditionTag() {
        this.ctx.body = new Rep({ data: dicCondition.mapping })
    }

    async condition() {
        this.ctx.body = new Rep({ data: dicCondition[this.ctx.query.t] })
    }

    async dictionary() {
        if (!this.ctx.request.query.t) {
            this.ctx.body = new Rep({ code: 401, msg: 'paramater \'t\' missed', data: [] })
        } else {
            let keywords = ''
            if (this.ctx.request.query.k) { keywords = this.ctx.request.query.k || '' }
            let res = await this.ctx.service.dictionary.search('mrfs', keywords)
            this.ctx.body = new Rep({ data: res })
        }
    }
}

module.exports = DicController
