module.exports.Wsl = class Wsl {
    _source = []
    timeout = '10s'
    size = 100
    query = {}

    constructor({ _source = ['MRID'], timeout = '300s', size = 200000000, query = {} }) {
        this._source = _source
        this.timeout = timeout
        this.size = size
        this.query = query
    }

    get wsl() {
        return {
            body: {
                _source: this._source,
                timeout: this.timeout,
                query: this.query.wsl,
                size: this.size,
            }
        }
    }
}

module.exports.Bool = class Bool {
    filter = []
    should = []
    must = []
    must_not = []
    minimum_should_match = 0
    boost = 1.0

    constructor({ filter = [], should = [], must = [], must_not = [] }) {
        this.filter = filter
        this.should = should
        this.must = must
        this.must_not = must_not
    }

    get wsl() {
        return {
            bool: {
                filter: this.filter,
                should: this.should,
                must: this.must,
                must_not: this.must_not,
                minimum_should_match: this.minimum_should_match,
                boost: this.boost,
            }
        }
    }

    addTermTo(occur, fields, value) {
        this[occur].push({
            term: {
                [fields + '.keyword']: value
            }
        })
    }

    addTermsTo(occur, fields, value) {
        this[occur].push({
            terms: {
                [fields + '.keyword']: value
            }
        })
    }

    addRangeTo(occur, fields, r, v) {
        this[occur].push({
            range: {
                [fields]: {
                    [r]: v
                }
            }
        })
    }

    addNestedTo(occur, nested) {
        this[occur].push(nested)
    }
}

module.exports.Nested = class Nested {
    path = ''
    query = new Bool()
    constructor(path = '', query = new Bool()) {
        this.path = path
        this.query = query
    }
}