const elasticsearch = require('elasticsearch')
const Service = require('egg').Service

const client = new elasticsearch.Client({
    host: '172.30.199.166:9200',
    // index: 'bei',
    index: 'mrfs',
    apiVersion: '7.6',
})

class ESService extends Service {
    async getPatientByName(keywords) {
        try {
            let wsl = {
                body: {
                    query: {
                        match: {
                            patient_name: keywords,
                        },
                    },
                },
            }
            console.log(JSON.stringify(wsl))
            const res = await client.search(wsl)
            return res.hits.hits
        } catch (error) {
            console.trace(error.message)
        }
    }

    async search(dsl) {
        try {
            const res = await client.search(dsl)
            return res.hits.hits
        } catch (error) {
            console.trace(error.message)
        }
    }
}

module.exports = ESService
