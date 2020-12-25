exports.keys = 'docimax'

exports.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
        '.tpl': 'nunjucks'
    }
}
// add middleware robot
exports.middleware = [
    'robot'
]
// robot's configurations
exports.robot = {
    ua: [
        /Baiduspider/i,
    ]
}