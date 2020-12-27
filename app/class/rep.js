module.exports = class Rep {
    /**
     * 响应码
     */
    code = 200
    /**
     * 响应信息
     */
    msg = ''
    /**
     * 响应结果
     */
    data = []
    constructor({ code = 200, msg = '', data = [] }) {
        this.code = code
        this.msg = msg
        this.data = data
    }
}