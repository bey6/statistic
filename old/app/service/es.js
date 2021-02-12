const elasticsearch = require("elasticsearch");
const Service = require("egg").Service;
const env = require("../env");
const { es } = require("../config")[env];

const client = new elasticsearch.Client({
    host: es.host,
    index: es.index,
    apiVersion: es.apiVersion,
    // requestTimeout: es.requestTimeout,
});

class ESService extends Service {
    async search(dsl) {
        const res = await client.search(dsl);
        return res;
    }

    async count(dsl) {
        const res = await client.count({
            index: es.index,
            body: {
                query: dsl.body.query,
            },
        });
        return res.count;
    }
}

module.exports = ESService;
