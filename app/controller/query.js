const Controller = require('egg').Controller
const moment = require('moment')
const dic_condition = require('../dic/dic_conditions')
const { Wsl, Bool, Nested } = require('../class/wsl')

class QueryController extends Controller {
    async index() {
        await this.ctx.render('query/index.html', {
            conditions: dic_condition.common,
            tags: dic_condition.mapping,
        })
    }

    // 查询
    async search() {
        try {
            let mapping = ['name', 'code', 'relation', 'operation', 'value'],
                columns = [
                    'MRID',
                    'DischargeDateTime',
                    'PatientName',
                    'Diagnosis',
                ],
                formData = [],
                res
            if (typeof this.ctx.request.body.name === 'string')
                formData.push(this.ctx.request.body)
            else
                mapping.forEach((m, idx) => {
                    let arr = this.ctx.request.body[m]
                    arr.forEach((value, idxItem) => {
                        if (idx === 0) {
                            formData.push({
                                [m]: value,
                            })
                        } else {
                            formData[idxItem][m] = value
                        }
                    })
                })
            // 异次病发
            if (formData.some((v) => v.operation === 'diff'))
                res = await this.diffParoxysmQuery(formData, columns)
            else res = await this.standardQuery(formData, columns)

            let resArr = res.map((d) => ({
                ...d._source,
                DischargeDateTime: moment(d._source.DischargeDateTime).format(
                    'YYYY-MM-DD hh:mm:ss'
                ),
                Diagnosis: d._source.Diagnosis.map(
                    (c) => c.InternalICDCode
                ).join(', '),
            }))
            await this.ctx.render('query/result.html', {
                list: resArr,
                columns: columns,
            })
        } catch (error) {
            this.ctx.body = error
        }
    }

    // 获取 wsl
    getWsl(diagnosis_array, formData, columns) {
        let wsl = {
            body: {
                _source: columns,
                timeout: '30000s',
                query: {
                    bool: {
                        must: [
                            {
                                range: {
                                    DischargeDateTime: {
                                        gte: '2007-01-01T18:25:01.000',
                                        lte: '2014-10-10T18:25:01.000',
                                    },
                                },
                            },
                            {
                                nested: {
                                    path: 'Diagnosis',
                                    query: {
                                        bool: {
                                            should: diagnosis_array.map(
                                                (d) => ({
                                                    term: {
                                                        'Diagnosis.InternalICDCode.keyword': d,
                                                    },
                                                })
                                            ),
                                            minimum_should_match: 1,
                                            boost: 1.0,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
                size: 200000000,
            },
        }
        return wsl
    }

    // 组装不包含异次病发的基础 wsl
    packageWsl(formData, columns) {
        let wsl = new Wsl(columns, '300000s', 20000, '30000s')
        let query = new Bool()
        // 如果没有 or 关系的，这个参数给 1 拿不到结果
        if (formData.some((c) => c.relation === 'or'))
            query.bool.minimum_should_match = 1
        formData.forEach((condition) => {
            let occur = 'must'
            if (condition.relation === 'or') occur = 'should'
            switch (condition.operation) {
                case 'eq':
                    query.addTermTo(occur, condition.code, condition.value)
                    break
                case 'gt':
                    query.addRangeTo(
                        occur,
                        condition.code,
                        'gt',
                        condition.value
                    )
                    break
                case 'gte':
                    query.addRangeTo(
                        occur,
                        condition.code,
                        'gte',
                        condition.value
                    )
                    break
                case 'lt':
                    query.addRangeTo(
                        occur,
                        condition.code,
                        'lt',
                        condition.value
                    )
                    break
                case 'lte':
                    query.addRangeTo(
                        occur,
                        condition.code,
                        'lte',
                        condition.value
                    )
                    break
                case 'in':
                    query.addTermsTo(
                        occur,
                        condition.code,
                        condition.value.split(',')
                    )
                    break
                default:
                    break
            }
        })
        wsl.body.query = query
        return wsl
    }

    // 获取异次病发病案号
    async getParoxysmMrids(diagnosis_array_2d, formData, columns) {
        let mrids = [], // 不去重的 mrids
            paroxysm = [] // 符合异次病发的 mrid

        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x]
            let wsl = this.packageWsl(formData, columns)
            let nestedBool = new Bool([], [], [], [], 1)
            diagnosis_array_1d.forEach((d) => {
                nestedBool.addTermTo(
                    'should',
                    'Diagnosis.InternalICDCode',
                    d
                )
            })
            let nested = new Nested('Diagnosis', nestedBool)
            wsl.body.query.addNestedTo('must', nested)
            let list = await this.ctx.service.es.search(wsl)
            if (list.length === 0) return []
            else
                mrids.push(
                    ...Array.from(new Set(list.map((d) => d._source.MRID)))
                )
        }
        Array.from(new Set(mrids)).forEach((mrid) => {
            if (
                mrids.filter((m) => m === mrid).length ===
                diagnosis_array_2d.length
            )
                paroxysm.push(mrid)
        })
        return paroxysm
    }

    // 获取异次病发文档记录
    async getParoxysmRecords(diagnosis_array_2d, paroxysm_mrids, formData, columns) {

        let wsl = this.packageWsl(formData, columns)
        wsl.body.query.bool.minimum_should_match = 1
        // 填充 filter
        wsl.body.query.addTermsTo('filter', 'MRID', paroxysm_mrids)
        let nestedBool = new Bool([], [], [], [], 1)
        // 填充 should
        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x]
            let bool = new Bool([], [], [], [], 1)
            bool.bool.should = diagnosis_array_1d.map(d => ({
                term: {
                    'Diagnosis.InternalICDCode.keyword': d
                }
            }))
            nestedBool.bool.should.push(bool)
        }
        let nst = new Nested('Diagnosis', nestedBool)
        wsl.body.query.addNestedTo('should', nst)
        let res = await this.ctx.service.es.search(wsl)
        return res
    }

    /**
     * 标准查询
     * @param { array } formData 组织好的参数数组
     */
    async standardQuery(formData, columns) {
        let wsl = this.packageWsl(formData, columns)
        let list = await this.ctx.service.es.search(wsl)
        return list
    }

    /**
     * 异次并发查询
     * @param { array } formData 组织好的参数数组
     */
    async diffParoxysmQuery(formData, columns) {
        // 希望异次并发的项
        // 一维数组中的每个项都必须满足
        // 二维数组中的每个项之间只需要满足其中一个即可

        let paroxysm_diagnosis_items = []
        formData
            .filter((d) => d.operation === 'diff')
            .forEach((c) => {
                paroxysm_diagnosis_items.push(c.value.split(','))
            })

        // 获取符合异次发病的所有 MRID
        let paroxysm_mrids = await this.getParoxysmMrids(
            paroxysm_diagnosis_items,
            formData,
            columns
        )

        // 根据 MRID 获取异次并发记录
        return this.getParoxysmRecords(paroxysm_diagnosis_items, paroxysm_mrids, formData, columns)
    }
}

module.exports = QueryController
