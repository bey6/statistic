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

    // 获取字典
    async dictionary() {
        try {
            if (!this.ctx.request.query.t) {
                this.ctx.body = new Rep({
                    code: 401,
                    msg: "paramater 't' missed",
                    data: [],
                })
            } else {
                let keywords = ''
                if (this.ctx.request.query.k)
                    keywords = this.ctx.request.query.k || ''
                let res = await this.ctx.service.dictionary.mrfsSearch(keywords)
                this.ctx.body = new Rep({ data: res.recordset })
            }
        } catch (error) {
            this.ctx.body = new Rep({ code: 500, msg: error.message, data: [] })
        }
    }
}

module.exports = DicController
