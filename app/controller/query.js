const Controller = require('egg').Controller
const moment = require('moment')
const dic_condition = require('../dic/dic_conditions')
const { Wsl, Bool, Nested } = require('../class/wsl')

class QueryController extends Controller {
    async index() {
        await this.ctx.render('query/index.html', { conditions: dic_condition.common, tags: dic_condition.mapping })
    }

    // 查询
    async search() {
        // H25.901
        // J96.901
        try {
            let mapping = ['name', 'code', 'relation', 'operation', 'value'],
                columns = ['MRID', 'DischargeDateTime', 'PatientName', 'Diagnosis'],
                formData = [],
                res
            if (typeof this.ctx.request.body.name === 'string') formData.push(this.ctx.request.body)
            else mapping.forEach((m, idx) => {
                let arr = this.ctx.request.body[m]
                arr.forEach((value, idxItem) => {
                    if (idx === 0) {
                        formData.push({
                            [m]: value
                        })
                    } else {
                        formData[idxItem][m] = value
                    }
                })
            })
            // 异次病发
            if (formData.some(v => v.operation === 'diff')) res = await this.diffParoxysmQuery(formData, columns)
            else res = await this.standardQuery(formData, columns)

            await this.ctx.render('query/result.html', { list: res, columns: columns })
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
                                        gte: "2007-01-01T18:25:01.000",
                                        lte: "2014-10-10T18:25:01.000"
                                    }
                                }
                            },
                            {
                                nested: {
                                    path: 'Diagnosis',
                                    query: {
                                        bool: {
                                            should: diagnosis_array.map(d => ({
                                                term: { 'Diagnosis.InternalICDCode.keyword': d }
                                            })),
                                            minimum_should_match: 1,
                                            boost: 1.0
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                size: 200000000
            }
        }
        return wsl
    }

    // 组装 wsl
    packageWsl(formData, columns) {
        let wsl = new Wsl({ _source: columns, query: {}, size: 20000, timeout: '30000s' })
        let query = new Bool({ filter: [], must: [], must_not: [], should: [] })
        // 如果没有 or 关系的，这个参数给 1 拿不到结果
        if (formData.some(c => c.relation === 'or')) query.minimum_should_match = 1
        formData.forEach(condition => {
            let occur = 'must'
            if (condition.relation === 'or') occur = 'should'
            switch (condition.operation) {
                case 'eq':
                    query.addTermTo(occur, condition.code, condition.value)
                    break;
                case 'gt':
                    query.addRangeTo(occur, condition.code, 'gt', condition.value)
                    break;
                case 'gte':
                    query.addRangeTo(occur, condition.code, 'gte', condition.value)
                    break;
                case 'lt':
                    query.addRangeTo(occur, condition.code, 'lt', condition.value)
                    break;
                case 'lte':
                    query.addRangeTo(occur, condition.code, 'lte', condition.value)
                    break;
                case 'in':
                    query.addTermsTo(occur, condition.code, condition.value.split(','))
                    break;
                default:
                    break;
            }
        })
        wsl.query = query
        return wsl
    }

    // 获取异次病发病案号
    async getParoxysmMrids(diagnosis_array_2d, formData, columns) {
        let mrids = [], // 不去重的 mrids
            paroxysm = [] // 符合异次病发的 mrid

        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x]
            let wsl = this.packageWsl(formData, columns)
            let nestedBool = new Bool({ filter: [], must: [], must_not: [], should: [] })
            diagnosis_array_1d.forEach(d => {
                nestedBool.addTermsTo('should', 'Diagnosis.InternalICDCode.keyword', d)
            })
            let nested = new Nested('Diagnosis', nestedBool)
            wsl.query.addNestedTo('must', nested)
            let list = await this.ctx.service.es.search(wsl.wsl)
            if (list.length === 0) return []
            else mrids.push(...Array.from(new Set(list.map(d => d._source.MRID))))
        }
        Array.from(new Set(mrids)).forEach(mrid => {
            if (mrids.filter(m => m === mrid).length === diagnosis_array_2d.length) paroxysm.push(mrid)
        })
        return paroxysm
    }

    // 获取异次病发文档记录
    async getParoxysmRecords(diagnosis_array_2d, paroxysm_mrids) {
        let wsl = {
            body: {
                timeout: '300s',
                query: {
                    bool: {
                        filter: [
                            {
                                terms: {
                                    'MRID.keyword': paroxysm_mrids
                                }
                            }
                        ],
                        should: [
                            {
                                nested: {
                                    path: 'Diagnosis',
                                    query: {
                                        bool: {
                                            should: diagnosis_array_2d.map(diagnosis_array_1d => {
                                                return {
                                                    bool: {
                                                        should: diagnosis_array_1d.map(diagnosis => ({
                                                            term: {
                                                                "Diagnosis.InternalICDCode.keyword": diagnosis
                                                            }
                                                        })),
                                                        minimum_should_match: 1,
                                                        boost: 1.0
                                                    }
                                                }
                                            }),
                                        }
                                    }
                                }
                            }
                        ],
                        minimum_should_match: 1,
                        boost: 1
                    }
                },
                sort: [
                    {
                        'MRID.keyword': { order: 'desc' },
                    }
                ],
                size: 200000000
            }
        }

        let res = await this.ctx.service.es.search(wsl)

        return res.map(r => ({ mrid: r._source.MRID, date: r._source.DischargeDateTime, diagnosis: r._source.Diagnosis }))
    }

    /**
     * 标准查询
     * @param { array } formData 组织好的参数数组
     */
    async standardQuery(formData, columns) {
        let wsl = this.packageWsl(formData, columns)
        let list = await this.ctx.service.es.search(wsl.wsl)
        if (list.length === 0) return [] // 有一个不满足则表示不满足，直接返回空
        else records = list.map(d => ({ ...d._source, DischargeDateTime: moment(d._source.DischargeDateTime).format('YYYY-MM-DD hh:mm:ss'), Diagnosis: d._source.Diagnosis.map(c => c.InternalICDCode).join(', ') }))
        return records
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
        formData.filter(d => d.operation === 'diff').forEach(c => {
            paroxysm_diagnosis_items.push(c.value.split(','))
        })

        // 获取符合异次发病的所有 MRID
        let paroxysm_mrids = await this.getParoxysmMrids(paroxysm_diagnosis_items, formData, columns)
        console.log(paroxysm_mrids)
        // 根据 MRID 获取异次并发记录
        return this.getParoxysmRecords(paroxysm_diagnosis_items, paroxysm_mrids)
    }
}

module.exports = QueryController