const Controller = require('egg').Controller

class HomeController extends Controller {
    async index() {
        let packages = [
            {
                key: 1,
                name: 'pkg_1',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 2,
                name: 'pkg_2',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 3,
                name: 'pkg_3',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 4,
                name: 'pkg_4',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 5,
                name: 'pkg_5',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 6,
                name: 'pkg_6',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 7,
                name: 'pkg_7',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 9,
                name: 'pkg_9',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 10,
                name: 'pkg_10',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
            {
                key: 11,
                name: 'pkg_11',
                description: '🧪 A test query package.',
                contributor: '艾因斯喵',
            },
        ]
        await this.ctx.render('home/index.html', { packages })
    }
}

module.exports = HomeController
