module.exports.Wsl = class Wsl {
    constructor(_source = ['MRID'], timeout = '300s', size = 200000000, query = {}) {
        this.body = {
            _source: _source,
            timeout: timeout,
            size: size,
            query: query,
            sort: [{
                'MRID.keyword': { order: 'desc' }
            }]
        }
    }
}

module.exports.Bool = class Bool {
    constructor(filter = [], should = [], must = [], must_not = [], minimum_should_match = 0) {
        this.bool = {
            filter: filter,
            should: should,
            must: must,
            must_not: must_not,
            minimum_should_match: minimum_should_match,
            boost: 1.0,
        }
    }

    addTermTo(occur, fields, value) {
        this.bool[occur].push({
            term: {
                [fields + '.keyword']: value,
            },
        })
    }

    addTermsTo(occur, fields, value) {
        this.bool[occur].push({
            terms: {
                [fields + '.keyword']: value,
            },
        })
    }

    addRangeTo(occur, fields, r, v) {
        this.bool[occur].push({
            range: {
                [fields]: {
                    [r]: v,
                },
            },
        })
    }

    addNestedTo(occur, nested) {
        this.bool[occur].push(nested)
    }

    addBoolTo(occur, query) {
        this.bool[occur].push(query)
    }
}

module.exports.Nested = class Nested {
    constructor(path = '', query) {
        this.nested = {
            path: path,
            query: query,
        }
    }
}
