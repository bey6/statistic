const elasticsearch = require('elasticsearch')
const Service = require('egg').Service

const client = new elasticsearch.Client({
    host: '172.30.199.166:9200',
    index: 'mrfs',
    apiVersion: '7.6',
    requestTimeout: 300000,
})

class ESService extends Service {
    async search(dsl) {
        const res = await client.search(dsl)
        return res.hits.hits
    }

    async count(dsl) {
        const res = await client.count({
            body: {
                query: dsl.body.query,
            },
        })
        return res.count
    }
}

module.exports = ESService
