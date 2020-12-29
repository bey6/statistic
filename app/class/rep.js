module.exports = class Rep {
    constructor({ code = 200, msg = '', data = [] }) {
        this.code = code
        this.msg = msg
        this.data = data
    }
}
