const Controller = require('egg').Controller
const moment = require('moment')
class NotificationController extends Controller {
    async list() {
        let res = await this.ctx.service.mrquery.getSearchTask()
        await this.ctx.render('notification/list.html', { tasks: res.recordset.map(r => ({ ...r, CreateDate: moment(r.CreateDate).format('YYYY-MM-DD hh:mm:ss') })) })
    }
}

module.exports = NotificationController
