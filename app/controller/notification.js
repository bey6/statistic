const Controller = require('egg').Controller

class NotificationController extends Controller {
    async list() {
        await this.ctx.render('notification/list.html')
    }
}

module.exports = NotificationController
