var elasticsearch = require('elasticsearch');
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
//let host = 'localhost:9200'
//let host = '172.30.199.33:9200'
const config = require('./config')
let host = config.host;
let client = undefined
var es = {
  getclient: function () {
    //console.log(host);
    if (client === undefined)
      client = elasticsearch.Client({
        host,
      });
    return client
  },
  getIdString: function (pre) {
    let id = pre;
    let s = new Date();
    id +=
      s.getFullYear().toString() +
      s.getMonth().toString() +
      s.getDate().toString() +
      s.getHours().toString();
    id +=
      s.getMinutes().toString() +
      s.getSeconds().toString() +
      s.getMilliseconds().toString() +
      Math.round(Math.random() * 1000).toString();
    const tsleep = (time) => {
      return new Promise(resolve => setTimeout(resolve, time))
    }
    tsleep(1)
    return id.slice(0, 20);
  },
  hostlist: ([] = []),
  setEsUrl: function (host) {
    if (host != undefined) {
      hostlist = [];
      host.forEach((element) => {
        hostlist.push(element);
      });
    }
    console.log(hostlist);
  },

  query: async function (index, querystring, col) {
    var client = elasticsearch.Client({
      hosts: [hostlist],
    });
    let ss = {
      size: 50,
      body: {
        query: {
          simple_query_string: {
            query: '',
            default_operator: 'and',
          },
        },
      },
    };
    ss['index'] = index;
    ss['body']['query']['simple_query_string']['query'] = querystring;
    if (col != undefined && col !== '') {
      ss.query.simple_query_string['fields'] = col.split(',');
    }
    let strss = JSON.stringify(ss);
    console.log(' query string:' + strss);
    return await client.search(ss, {
      ignore: [404],
      maxRetries: 3,
    });
  },
  getMapping: async function (index) {
    var client = elasticsearch.Client({
      hosts: [hostlist],
    });
    let ss = {
      include_type_name: false,
    };
    ss['index'] = index;

    let strss = JSON.stringify(ss);
    console.log(' query string:' + strss);
    return await client.indices.getMapping(ss, {
      ignore: [404],
      maxRetries: 3,
    });
  },
  createIndex: async function (index, type) {
    let ss = {};
    ss['index'] = index;
    ss['type'] = type;
    ss['id'] = this.getIdString('lg');
    ss['body'] = {};
    return await client.index(ss, function (err, resp) {
      if (err) return err;
      return resp;
    });
  },
  deleteDocumentBulk: async function (index, ids, idfield) {
    const query = {
      bool:
      {
        must: []
      }
    }
    let qo = {};
    qo[idfield] = ids
    let terms = { terms: qo }
    client = this.getclient();
    query.bool.must.push(terms)
    try {
      const r = await client.deleteByQuery({
        index: index,

        body: query
      })
    }
    catch (err) {
      console.log(err)
    }
  },
  addDocumentBulk: async function (index, dataset, idfield) {
    //doc must include id
    const body = dataset.flatMap((doc) => [
      {
        index: {
          _index: index,
          _id: doc[idfield],
        },
      },
      doc,
    ]);
    client = this.getclient();
    const { body: bulkResponse } = await client.bulk({
      refresh: true,
      body,
    });

    if (bulkResponse !== undefined && bulkResponse.errors) {
      const erroredDocuments = [];
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          transerrors.push({
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1],
          });
        }
      });
      console.log(transerrors);
    }
  },
  addDocument: async function (index, id, doc) {
    let ss = {};
    ss['index'] = index;
    //ss['type'] = type
    ss['id'] = id;
    ss['body'] = doc;
    client = this.getclient();
    //console.log('add doc');
    let r = await client.create(ss, {
      ignore: [508],
      maxRetries: 3,
    });
    return r;
  },
  deleteDocument: async function (index, id) {
    let ss = {};
    ss['index'] = index;
    ss['id'] = id;
    let r = await this.getclient().delete(ss, {
      ignore: [508],
      maxRetries: 3,
    });
    return r;
  },
  modifyDocument: async function (index, id, doc) {
    let ss = {};
    ss['index'] = index;

    ss['id'] = id;
    ss['body'] = {};
    ss['body']['doc'] = doc;
    //console.log(doc);
    // console.log(JSON.stringify(ss));
    // try {
    //   let client = this.getclient()
    //   await client.update(ss);
    // }
    // catch (err) {
    //   console.log(err);
    // }
    try {
      await this.deleteDocument(index, id)
      await this.addDocument(index, id, doc)
    }
    catch (err) {
      console.log('modified error:' + id);
      console.log(err);
      return
    }
    console.log('finished:' + id);
  },
  getDocumentById: async function (index, id) {
    let ss = {};
    ss['index'] = index;
    //ss['type'] = type
    ss['id'] = id;
    // let su = {}
    // su['index'] = index
    // su['id'] = id
    // su['body'] = {
    //     "script": "ctx._source.access ++"
    // }
    // this.getclient().update(su)
    // console.log('start get');
    // console.log(JSON.stringify(ss));
    try {
      let r = await this.getclient().getSource(ss, {
        ignore: [404],
        maxRetries: 3,
      });
      // console.log('finished');
      // console.log(r);
      return r;
    } catch (ex) {
      return undefined;
    }
  },

  searchfield: function (index, querystring, col) {
    let ss = {
      size: 2000000,
      body: {
        query: {
          match: {},
        },
      },
    };
    ss['index'] = index;
    ss.body.query.match[col] = querystring;
    this.getclient()
      .search(ss)
      .then(function (resp) {
        console.log(resp);
        resp.hits.hits.map((v) => console.dir(v));
        return resp.hits.hits;
      });
  },
  search: async function (index, dsl) {
    let ss = {
      size: 200000000,
      body: dsl,
    };
    ss['index'] = index;
    //ss.body.query.match[col] = querystring;
    //console.log(ss);
    let resp = await this.getclient().search(ss);

    //console.log(resp);
    //resp.hits.hits.map((v) => console.dir(v));
    return resp.hits.hits;
  },
};
module.exports = es;
