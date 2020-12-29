exports.keys = 'docimax'
exports.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
        '.tpl': 'nunjucks',
    },
}
// add middleware robot
exports.middleware == ['robot']
// robot's configurations
exports.robot = {
    ua: [/Baiduspider/i],
}
exports.security = {
    csrf: {
        queryName: '_csrf', // 通过 query 传递 CSRF token 的默认字段为 _csrf
        bodyName: '_csrf', // 通过 body 传递 CSRF token 的默认字段为 _csrf
    },
}

// 表单最大长度
exports.bodyParser = {
    jsonLimit: '2mb',
    formLimit: '2mb',
}
