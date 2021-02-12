const md5 = require('md5')

module.exports = {
    uuid: () => md5(new Date().getTime() + Math.random()),
}
