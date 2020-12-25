const Controller = require('egg').Controller

class QueryController extends Controller {
    async index() {
        await this.ctx.render('query/index.html')
    }

    getWsl(diagnosis_array) {
        // let wsl = {
        //     body: {
        //         _source: ['mrid'],
        //         query: {
        //             bool: {
        //                 should: diagnosis_array.map(d => ({
        //                     term: { 'pumch.out_diagnosis.code.keyword': d }
        //                 })),
        //                 minimum_should_match: 1,
        //                 boost: 1.0
        //             }
        //         }
        //     }
        // }
        let wsl = {
            body: {
                _source: ['MRID'],
                timeout: '300s',
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

    async getParoxysmMrids(diagnosis_array_2d) {
        let mrids = [], // 不去重的 mrids
            paroxysm = [] // 符合异次病发的 mrid

        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x]
            let list = await this.ctx.service.es.search(this.getWsl(diagnosis_array_1d))
            if (list.length === 0) return [] // 有一个不满足则表示不满足，直接返回空
            // else mrids.push(...Array.from(new Set(list.map(d => d._source.mrid))))
            else mrids.push(...Array.from(new Set(list.map(d => d._source.MRID))))
        }
        Array.from(new Set(mrids)).forEach(mrid => {
            if (mrids.filter(m => m === mrid).length === diagnosis_array_2d.length) paroxysm.push(mrid)
        })
        return paroxysm
    }

    async getParoxysmRecords(diagnosis_array_2d, paroxysm_mrids) {
        let wsl = {
            body: {
                timeout: '300s',
                query: {
                    bool: {
                        filter: [
                            {
                                terms: {
                                    // 'mrid.keyword': paroxysm_mrids
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
                        // DischargeDateTime: { order: 'desc' },
                        'MRID.keyword': { order: 'desc' },
                    }
                ],
                size: 200000000
            }
        }
        let res = await this.ctx.service.es.search(wsl)
        // return res.map(r => r._source)
        // return res.map(r => ({ mrid: r._source.mrid, date: r._source.out_datetime, diagnosis: r._source.pumch.out_diagnosis }))

        return res.map(r => ({ mrid: r._source.MRID, date: r._source.DischargeDateTime, diagnosis: r._source.Diagnosis }))
    }

    async search() {
        try {
            if (!this.ctx.query.id) return
            // 2321391,2251626
            // 希望异次并发的项
            // 一维数组中的每个项都必须满足
            // 二维数组中的每个项之间只需要满足其中一个即可
            let paroxysm_diagnosis_items = [
                ['Z51.101', 'J04.002'],
                ['C79.809', 'J21.901']
                // ['I50.904'],
                // ['N20.001']
            ]
            // 获取符合异次发病的所有 MRID
            let paroxysm_mrids = await this.getParoxysmMrids(paroxysm_diagnosis_items)
            // 根据 MRID 获取异次并发记录
            let paroxysm_records = await this.getParoxysmRecords(paroxysm_diagnosis_items, paroxysm_mrids)
            await this.ctx.render('query/result.html', { list: paroxysm_records })
        } catch (error) {
            this.ctx.body = error
        }
    }
}

module.exports = QueryController