const Controller = require('egg').Controller
const moment = require('moment')
const Rep = require('../class/rep')
class TaskController extends Controller {
    async list() {
        let res = await this.ctx.service.mrquery.getSearchTask()
        await this.ctx.render('task/list.html', {
            tasks: res.recordset.map((r, idx) => ({
                ...r,
                Key: idx + 1,
                CreateDate: moment(r.CreateDate).format('YYYY-MM-DD hh:mm:ss'),
            })),
        })
    }

    /**
     * to remind user that search task is completed
     */
    async remind() {
        let res = await this.ctx.service.mrquery.getSearchTaskUnread()
        this.ctx.body = new Rep({ data: res.recordset })
    }

    /**
     * to update the task name
     */
    async putTask() {
        try {
            if (!this.ctx.params.id) {
                this.ctx.body = new Rep({
                    code: 40000,
                    msg: "the param 'id' is invalid",
                })
            } else if (!this.ctx.request.body.name) {
                this.ctx.body = new Rep({
                    code: 40000,
                    msg: "the body param 'name' is invalid",
                })
            } else {
                let res = await this.ctx.service.mrquery.putSearchTaskName(
                    this.ctx.params.id,
                    this.ctx.request.body.name
                )
                let response = new Rep({
                    code: 50000,
                    data: res.rowsAffected[0],
                })
                if (response.data === 1) response.code = 200
                this.ctx.body = response
            }
        } catch (error) {
            this.ctx.body = new Rep({ code: 50000, msg: error.message })
        }
    }
}

module.exports = TaskController
