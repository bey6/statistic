const { Service } = require('egg')
// const axios = require('axios')
const fs = require('fs')

// const redis_url = 'http://xhdev.docimaxvip.com:6638'

class RedisService extends Service {
    async post(key, value) {
        // const res = await axios.post(redis_url + '/api/values/add', {
        //     key,
        //     describe: '统计系统临时查询包',
        //     obj: JSON.stringify(value)
        // })
        // return res
        fs.writeFileSync(`pkg/${key}.json`, value)
    }
    async put(key, value) {
        console.log(key, value)
    }
    get(key) {
        let res = fs.readFileSync(`pkg/${key}.json`, 'utf-8')
        return res
    }
    async delete(key) {
        console.log(key)
    }
}

module.exports = RedisService
