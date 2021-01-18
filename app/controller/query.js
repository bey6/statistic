const Controller = require('egg').Controller
const dic_condition = require('../dic/dic_conditions')
const { Wsl, Bool, Nested } = require('../class/wsl')
const fs = require('fs')
const Rep = require('../class/rep')
const util = require('../util')
const xlsx = require('node-xlsx')

class QueryController extends Controller {
    // 查询设计页面
    async index() {
        await this.ctx.render('query/index.html', {
            conditions: dic_condition.common,
            tags: dic_condition.mapping,
            title: '查询包',
        })
    }

    // 结果
    async result() {
        // search action 产生的 uuid
        // 后续会作为 redis 的 key 去提取 wsl
        if (!this.ctx.params.id) {
            this.ctx.body = new Rep({
                code: 50000,
                msg: 'id 参数是必传项',
            })
        } else {
            // { total: 123456, columns: [], wsl: {} }
            let f = this.ctx.service.redis.get(this.ctx.params.id),
                uu_session = JSON.parse(f),
                limit = this.ctx.request.query.limit || 50,
                pages_num = Math.ceil(
                    uu_session.total / (this.ctx.request.query.limit || 50)
                ),
                page = (this.ctx.request.query.page || 1) - 0,
                pages = []

            if (pages_num > 5) {
                if (pages_num - page < 4) {
                    pages = [
                        '1',
                        '···',
                        pages_num - 4 + '',
                        pages_num - 3 + '',
                        pages_num - 2 + '',
                        pages_num - 1 + '',
                        pages_num + '',
                    ]
                } else if (page > 4) {
                    pages = [
                        '1',
                        '···',
                        page - 2 + '',
                        page - 1 + '',
                        page + '',
                        page + 1 + '',
                        page + 2 + '',
                        '···',
                        pages_num + '',
                    ]
                } else {
                    pages = ['1', '2', '3', '4', '5', '···', pages_num + '']
                }
            } else if (pages_num === 1) pages = ['1']
            else
                for (let i = 0; i < pages_num; i++) {
                    pages.push(i + 1 + '')
                }

            let prevPage = page - 1 < 1 ? 1 : page - 1,
                nextPage = page + 1 > pages_num ? page : page + 1,
                wsl = uu_session.wsl

            wsl.from = page
            wsl.size = limit

            console.time('search')
            let res = await this.ctx.service.es.search(wsl)
            console.timeEnd('search')
            await this.ctx.render('query/result.html', {
                columns: uu_session.columns,
                list: res.map((d) => ({
                    ...d._source,
                    DischargeDateTime: d._source.DischargeDateTime.slice(0, 19).replace('T', ' '),
                    Diagnosis: d._source.Diagnosis.map(
                        (b) => {
                            if (b.InternalICDCode) {
                                return b.InternalICDCode + '（' + b.InternalICDName + '）'
                            } else return ''
                        }
                    ).join(', '),
                })),
                search_id: this.ctx.params.id,
                pages,
                prevPage,
                page: page + '',
                nextPage,
                total: uu_session.total,
            })
        }
    }

    // 导出
    async excel() {
        if (!this.ctx.params.id) {
            this.ctx.body = new Rep({
                code: 50000,
                msg: 'id 参数是必传项',
            })
        } else {
            let filePath = 'search_task/' + this.ctx.params.id + '.json'
            if (!fs.existsSync(filePath)) {
                this.ctx.body = new Rep({
                    code: 50000,
                    msg: 'search_id 无效，或该结果已被清理',
                })
            } else {
                let res = fs.readFileSync(filePath)
                let resObj = JSON.parse(res.toString())
                if (resObj.code && resObj.code === 20000) {
                    const data = [['MRID', 'PatientName', 'Diagnosis']]
                    let dataRow = resObj.data.map((row) => [
                        row.MRID,
                        row.PatientName,
                        row.Diagnosis,
                    ])
                    const options = {
                        '!cols': [
                            { wch: 10 },
                            { wch: 10 },
                            { wch: 40 },
                        ] /**, '!rows': [{ hpx: 50 }, { hpx: 50 }] */,
                    }
                    this.ctx.response.set(
                        'content-type',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    )
                    this.ctx.body = xlsx.build(
                        [{ name: 'sheet1', data: data.concat(dataRow) }],
                        options
                    )
                } else {
                    this.ctx.body = resObj
                }
            }
        }
    }

    // 查询
    async search() {
        const uuid = util.uuid()
        try {
            let mapping = ['name', 'code', 'relation', 'operation', 'vls'],
                columns = [
                    { name: '病案号', code: 'MRID' },
                    { name: '患者姓名', code: 'PatientName' },
                    { name: '性别', code: 'Gender' },
                    { name: '年龄', code: 'Age' },
                    { name: '编码状态', code: 'CodeState' },
                    { name: '出院时间', code: 'DischargeDateTime' },
                    { name: '协和诊断', code: 'Diagnosis' },
                    { name: '生日', code: 'Birthday' },
                    { name: '民族', code: 'Nation' },
                    { name: '已婚', code: 'Marriage' },
                    { name: '入院部门', code: 'InDepart' },
                    { name: '出院部门', code: 'OutDepart' },
                    { name: '血型', code: 'ABO' },
                    { name: '一般医疗服务费', code: 'VFee.一般医疗服务费' },
                ],
                formData = []
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
            // 后台执行异步查询, 不等待
            await this.asyncRun(formData, columns, uuid, 1, 50)
            this.ctx.redirect('/query/result/' + uuid + '?page=1')
        } catch (error) {
            this.ctx.body = new Rep({
                code: 50000,
                msg: error.message,
                data: { search_id: uuid },
            })
        }
    }

    // 异步执行
    async asyncRun(formData, columns, uuid, from, size) {
        let count = 0
        console.time('search')
        if (formData.some((v) => v.operation === 'diff'))
            count = await this.diffParoxysmQuery(formData, columns, uuid, from, size)
        else
            count = await this.standardQuery(
                formData,
                columns,
                uuid,
                from,
                size
            )
        console.timeEnd('search')
        return count
        // res.total = tmp.total
        // res.data = tmp.data.map((d) => ({
        //     ...d._source,
        //     Diagnosis: d._source.Diagnosis.map((g) => g.InternalICDCode).join(
        //         ', '
        //     ),
        // }))

        // return res
    }

    /**
     * 组装不包含异次病发的基础 wsl
     * @param {*} formData the form data that use submit
     * @param {*} columns the columns wsl will show
     * @param {*} size the size will es slice
     */
    packageWsl(formData, columns, from = 1, size = 50) {
        let wsl = new Wsl(columns, '300000ms', from, size, {})
        let query = new Bool()
        // 如果没有 or 关系的，这个参数给 1 拿不到结果
        if (formData.some((c) => c.relation === 'or'))
            query.bool.minimum_should_match = 1
        formData.forEach((condition) => {
            let occur = 'must'
            if (condition.relation === 'or') occur = 'should'
            switch (condition.operation) {
                case 'eq':
                    query.addTermTo(occur, condition.code, condition.vls)
                    break
                case 'gt':
                    query.addRangeTo(occur, condition.code, 'gt', condition.vls)
                    break
                case 'gte':
                    query.addRangeTo(
                        occur,
                        condition.code,
                        'gte',
                        condition.vls
                    )
                    break
                case 'lt':
                    query.addRangeTo(occur, condition.code, 'lt', condition.vls)
                    break
                case 'lte':
                    query.addRangeTo(
                        occur,
                        condition.code,
                        'lte',
                        condition.vls
                    )
                    break
                case 'in':
                    query.addTermsTo(
                        occur,
                        condition.code,
                        condition.vls.split(',')
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
    async getParoxysmMrids(diagnosis_array_2d, formData) {
        let mrids = [], // 不去重的 mrids
            paroxysm = [] // 符合异次病发的 mrid
        // console.log(JSON.stringify(diagnosis_array_2d))
        // 每组一次并发条件进行一次循环
        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x]
            let wsl = this.packageWsl(
                formData,
                ['MRID'],
                1,
                20000000
            )
            let nestedBool = new Bool([], [], [], [], 1)
            diagnosis_array_1d.forEach((d) => {
                // 本组诊断满足一个即可
                nestedBool.addTermTo('should', 'Diagnosis.InternalICDCode', d)
            })
            let nested = new Nested('Diagnosis', nestedBool)
            wsl.body.query.addNestedTo('must', nested)
            // console.log(JSON.stringify(wsl))
            let count = await this.ctx.service.es.count(wsl)
            if (count === 0) return []
            let res = await this.ctx.service.es.search(wsl)
            console.log(JSON.stringify(res))
            mrids.push(
                ...Array.from(new Set(res.map((d) => d._source.MRID)))
            )
        }
        mrids.forEach((mrid) => {
            if (
                mrids.filter((m) => m === mrid).length >=
                diagnosis_array_2d.length
            )
                paroxysm.push(mrid)
        })
        return paroxysm
    }

    // 获取异次病发文档记录
    async getParoxysmRecords(
        diagnosis_array_2d,
        paroxysm_mrids,
        formData,
        columns,
        uuid,
        from,
        size
    ) {
        let wsl = this.packageWsl(
            formData,
            columns.map((c) => c.code),
            from,
            size
        )
        wsl.body.query.bool.minimum_should_match = 1
        // 填充 filter
        wsl.body.query.addTermsTo('filter', 'MRID', paroxysm_mrids)
        let nestedBool = new Bool([], [], [], [], 1)
        // 填充 should
        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x]
            let bool = new Bool([], [], [], [], 1)
            bool.bool.should = diagnosis_array_1d.map((d) => ({
                term: {
                    'Diagnosis.InternalICDCode.keyword': d,
                },
            }))
            nestedBool.bool.should.push(bool)
        }
        let nst = new Nested('Diagnosis', nestedBool)
        wsl.body.query.addNestedTo('should', nst)
        // let res = await this.ctx.service.es.search(wsl)
        let count = await this.ctx.service.es.count(wsl)
        let session = { total: count, columns, wsl }
        await this.ctx.service.redis.post(uuid, JSON.stringify(session))
        return count
        // return res
    }

    /**
     * 标准查询
     * @param { array } formData 组织好的参数数组
     */
    async standardQuery(formData, columns, uuid, from, size) {
        let wsl = this.packageWsl(
            formData,
            columns.map((c) => c.code),
            from,
            size
        )
        let res = await this.ctx.service.es.count(wsl)
        let session = { total: res, columns, wsl }
        await this.ctx.service.redis.post(uuid, JSON.stringify(session))
        return res
    }

    /**
     * 异次并发查询
     * @param { array } formData 组织好的参数数组
     */
    async diffParoxysmQuery(formData, columns, uuid, from, size) {
        let paroxysm_diagnosis_items = []
        formData
            .filter((d) => d.operation === 'diff')
            .forEach((c) => {
                paroxysm_diagnosis_items.push(c.vls.split(','))
            })

        /**
         * 考虑把异次并发检索过滤出的 mrid 和用户给定的检索项存储到 redis
         * 1 页以后的检索可以提高性能
         *
         * search_after 虽然说性能上被描述为更加强劲，但理论上只能下一页
         * 而无法完成上一页、跳页等操作，因此可能需要酌情考虑是否合适
         *
         * 考虑还是使用 from + size 的组合来实现需求吧，但是要限制最大页码
         * 限制深度查询
         */

        // 获取符合异次发病的所有 MRID
        let paroxysm_mrids = await this.getParoxysmMrids(
            paroxysm_diagnosis_items,
            formData,
            ['MRID']
        )
        // 根据 MRID 获取异次并发记录
        return this.getParoxysmRecords(
            paroxysm_diagnosis_items,
            paroxysm_mrids,
            formData,
            columns,
            uuid,
            from,
            size
        )
    }
}

module.exports = QueryController
