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
}

module.exports = DicController
