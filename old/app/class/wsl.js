module.exports.Wsl = class Wsl {
    constructor(
        _source = ['MRID'],
        timeout = '300s',
        from = 0,
        size = 100,
        query = {},
        aggs = {},
    ) {
        this.body = {
            _source: _source,
            timeout: timeout,
            from: from,
            size: size,
            query: query,
            aggs: aggs,
            sort: [{ 'MRID.keyword': 'desc' }, { 'ID.keyword': 'desc' }],
        }
    }
}

module.exports.Bool = class Bool {
    constructor(
        filter = [],
        should = [],
        must = [],
        must_not = [],
        minimum_should_match = 0
    ) {
        this.bool = {
            filter: filter,
            should: should,
            must: must,
            must_not: must_not,
            minimum_should_match: minimum_should_match,
            boost: 1.0,
        }
    }

    // 数字类型不需要 .keyword
    _isNumber(key) {
        return [
            'Age',
            'NewBorn_Month',
            'NewBorn_Day',
            'NewBorn_Hour',
            'NewBorn_Weight',
            'Newborn_AdmissionWeight',
            'HospitalizedTimes',
            'InpatientDay',
            'RescueTime',
            'RescueSuccessTime',
            'DCPCIBeforeDay',
            'DCPCIBeforeHour',
            'DCPCIBeforeMinute',
            'DCPCIAfterDay',
            'DCPCIAfterHour',
            'DCPCIAfterMinute',
            'CodeState',
            'Totalcost',
            'SelfPayment',
            'MRWorkType',
            'DataSource',
        ].some((f) => f === key)
    }

    addTermTo(occur, fields, value) {
        let f = fields
        if (!this._isNumber(fields)) f = fields + '.keyword'
        this.bool[occur].push({
            term: {
                [f]: value,
            },
        })
    }

    addTermsTo(occur, fields, value) {
        let f = fields
        if (!this._isNumber(fields)) f = fields + '.keyword'
        this.bool[occur].push({
            terms: {
                [f]: value,
            },
        })
    }

    // range 理论上只能支持数字类型和日期类型
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

module.exports.Aggregation = class Aggregation {
    constructor(aggs) {
        this.init(aggs, this)
    }

    init(aggs, obj) {
        // 考虑可否在此处完成聚合嵌套
        aggs.forEach((a, idx) => {
            let aggName = a.name || `聚合_${idx}`

            obj[aggName] = {}
            if (a.type === 'script') {
                obj[aggName] = {
                    terms: {
                        script: {
                            lang: 'painless',
                            source: a.script
                        }
                    }
                }
                if (idx === 0) obj[aggName].terms.size = 50
            } else if (a.type === 'bucket_script') {
                obj[aggName] = {
                    bucket_script: {
                        buckets_path: {
                            x: '平均西药费',
                            z: '平均总费用',
                        },
                        script: a.script
                    }
                }
            } else {
                obj[aggName] = {
                    [a.type]: { field: a.field }
                }
            }

            if (a.aggs && a.aggs.length > 0) {
                obj[aggName].aggs = {}
                delete obj[aggName][a.type]
                this.init(a.aggs, obj[aggName].aggs)
            }
        })
    }
}