const { Service } = require('egg')
// const axios = require('axios')
const fs = require('fs')
const axios = require('axios')

const redis_url = 'http://xhdev.docimaxvip.com:6638'

class RedisService extends Service {
    async post(key, value) {
        const res = await axios.post(redis_url + '/api/values/add', {
            key,
            describe: '统计系统临时查询包',
            obj: value
        })
        return res
        // fs.writeFileSync(`pkg/${key}.json`, value)
    }
    async put(key, value) {
        console.log(key, value)
    }
    async get(key) {
        let res = await axios.get(redis_url + '/api/values/get?key=' + key)
        // let res = fs.readFileSync(`pkg/${key}.json`, 'utf-8')
        return res.data
    }
    async delete(key) {
        console.log(key)
    }
}

module.exports = RedisService
