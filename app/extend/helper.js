const moment = require('moment')

exports.relativeTime = (time) => moment(new Date(time * 1000)).fromNow()

// 这可以在模板里面这样使用: {{ helper.relativeTime(item.time) }}
