const Controller = require("egg").Controller;
const dic_condition = require("../dic/dic_conditions");
const dic_column = require("../dic/dic_columns");
const { Wsl, Bool, Nested, Aggregation } = require("../class/wsl");
const fs = require("fs");
const Rep = require("../class/rep");
const util = require("../util");
const xlsx = require("node-xlsx");
const formatter = require("../formatter");

class QueryController extends Controller {
    // 查询设计页面
    async index() {
        await this.ctx.render("query/index.html", {
            conditions: dic_condition.common,
            tags: dic_condition.mapping,
            title: "查询包",
        });
    }

    // 结果
    async result() {
        // search action 产生的 uuid
        // 后续会作为 redis 的 key 去提取 wsl
        if (!this.ctx.params.id) {
            this.ctx.body = new Rep({
                code: 50000,
                msg: "id 参数是必传项",
            });
        } else {
            // { total: 123456, columns: [], wsl: {} }
            let f = await this.ctx.service.redis.get(this.ctx.params.id);
            if (!f) {
                // await this.ctx.render('error/index.html', { msg: '查询会话已超时，请重新检索' })
                // return
                new Rep({ code: 50000, msg: "查询回话已超时，请重新检索" });
                return;
            }
            let uu_session = f,
                limit = this.ctx.request.query.limit || 50,
                pages_num = Math.ceil(
                    uu_session.total / (this.ctx.request.query.limit || 50)
                ),
                page = (this.ctx.request.query.page || 1) - 0,
                pages = [];

            if (pages_num > 5) {
                if (pages_num - page < 4) {
                    pages = [
                        "1",
                        "···",
                        pages_num - 4 + "",
                        pages_num - 3 + "",
                        pages_num - 2 + "",
                        pages_num - 1 + "",
                        pages_num + "",
                    ];
                } else if (page > 4) {
                    pages = [
                        "1",
                        "···",
                        page - 2 + "",
                        page - 1 + "",
                        page + "",
                        page + 1 + "",
                        page + 2 + "",
                        "···",
                        pages_num + "",
                    ];
                } else {
                    pages = ["1", "2", "3", "4", "5", "···", pages_num + ""];
                }
            } else if (pages_num === 1) pages = ["1"];
            else
                for (let i = 0; i < pages_num; i++) {
                    pages.push(i + 1 + "");
                }

            let prevPage = page - 1 < 1 ? 1 : page - 1,
                nextPage = page + 1 > pages_num ? page : page + 1,
                wsl = uu_session.wsl;
            if (Object.keys(wsl.body.aggs).length === 0) {
                wsl.body.from = (page - 1) * limit;
                wsl.body.size = limit;
            } else {
                wsl.body.from = 0;
                wsl.body.size = 0;
            }
            console.time("search");
            let res = await this.ctx.service.es.search(wsl);
            console.timeEnd("search");
            let { columns, total } = uu_session;
            if (Object.keys(wsl.body.aggs).length === 0) {
                await this.ctx.render("query/result.html", {
                    columns: columns,
                    list: res.hits.hits.map((row) => this.mapping(row._source, columns)),
                    search_id: this.ctx.params.id,
                    pages,
                    prevPage,
                    page: page + "",
                    nextPage,
                    total: total,
                });
            } else {
                // let keys = Object.keys(res.aggregation)
                // keys.forEach(key => {
                // let key_keys = Object.keys(res.aggregation[key])
                // });
                await this.ctx.render("query/aggs.html", {
                    columns: [
                        { name: "类目", code: "suborder" },
                        { name: "类目数量", code: "doc_count" },
                        { name: "平均西药费", code: "平均西药费" },
                        { name: "平均总费用", code: "平均总费用" },
                        { name: "平均住院天", code: "平均住院天" },
                        { name: "西药费占比", code: "西药费占比" },
                    ],
                    list: res.aggregations.主要诊断顺位表.buckets.map((d) => ({
                        suborder: d.key,
                        doc_count: d.doc_count,
                        平均西药费: d.平均西药费.value.toFixed(2),
                        平均总费用: d.平均总费用.value.toFixed(2),
                        平均住院天: d.平均住院天.value.toFixed(2),
                        西药费占比: d.西药费占比.value.toFixed(2) + "%",
                    })),
                    search_id: this.ctx.params.id,
                });
            }
        }
    }

    // 导出
    async excel() {
        if (!this.ctx.params.id) {
            this.ctx.body = new Rep({
                code: 50000,
                msg: "id 参数是必传项",
            });
        } else {
            let f = await this.ctx.service.redis.get(this.ctx.params.id);
            if (!f) {
                await this.ctx.render("error/index.html", {
                    msg: "查询会话已超时，请重新检索",
                });
                return;
            }

            let uu_session = f,
                limit = 1000,
                pages_num = Math.ceil(uu_session.total / limit),
                wsl = uu_session.wsl;
            wsl.body.size = limit;

            // 列头
            const data = [[...uu_session.columns.map((c) => c.name)]];
            let dataRow = [];
            console.time("dowload");
            for (let p = 0; p < pages_num; p++) {
                wsl.body.from = p * limit;
                let res = await this.ctx.service.es.search(wsl);
                // 🐛🐛🐛 这里可能会因为检索和统计的不同而取不同的导出结果
                // 检索：hits
                // 统计：aggregations
                dataRow = dataRow.concat(
                    res.map((row) =>
                        this.mapping(row._source, uu_session.columns, "array")
                    )
                );
            }
            console.timeEnd("dowload");

            // // 样式
            // const options = {
            //     '!cols': [
            //         { wch: 10 },
            //         { wch: 10 },
            //         { wch: 40 },
            //     ] /**, '!rows': [{ hpx: 50 }, { hpx: 50 }] */,
            // }

            // 设置相应体类型
            this.ctx.response.set(
                "content-type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            // 构建 excel
            this.ctx.body = xlsx.build(
                [{ name: "sheet1", data: data.concat(dataRow) }]
                // options
            );
        }
    }

    // 查询
    async search() {
        const uuid = util.uuid();
        try {
            if (!this.ctx.request.body) {
                this.ctx.body = new Rep({
                    code: 40000,
                    msg: "请求体不合法",
                    data: { search_id: uuid },
                });
                return;
            }
            if (
                !this.ctx.request.body.query ||
                this.ctx.request.body.query.length === 0
            ) {
                this.ctx.body = new Rep({
                    code: 40000,
                    msg: "请求体不合法",
                    data: { search_id: uuid },
                });
                return;
            }
            if (
                !this.ctx.request.body.source ||
                this.ctx.request.body.source.length === 0
            ) {
                this.ctx.body = new Rep({
                    code: 40000,
                    msg: "请求体不合法",
                    data: { search_id: uuid },
                });
                return;
            }
            //// 统计参数
            // if (!this.ctx.request.body.aggregation || this.ctx.request.body.aggregation.length === 0) {
            //     this.ctx.body = new Rep({
            //         code: 40000,
            //         msg: '请求体不合法',
            //         data: { search_id: uuid },
            //     })
            //     return
            // }
            let columns = [];
            this.ctx.request.body.source.forEach((col) => {
                let column = dic_column.columns.find((c) => c.name === col.name);
                if (column) {
                    let t = JSON.parse(JSON.stringify(column));
                    if (t.extension) {
                        if (!col.extension.show_code) t.extension.show_code = false;
                        if (col.extension.separate_main) t.extension.separate_main = true;
                    }
                    columns.push(t);
                }
            });
            // 后台执行异步查询, 不等待
            await this.asyncRun(
                this.ctx.request.body.query,
                columns,
                this.ctx.request.body.aggregation,
                uuid,
                1,
                50
            );
            this.ctx.body = new Rep({
                data: uuid,
            });
            // this.ctx.redirect('/query/result/' + uuid + '?page=1')
        } catch (error) {
            console.log(error);
            this.ctx.body = new Rep({
                code: 50000,
                msg: error.message,
                data: { search_id: uuid },
            });
        }
    }

    // 异步执行
    async asyncRun(query, source, aggregation, uuid, from, size) {
        let count = 0;
        console.time("search");
        if (query.some((v) => v.operation === "diff"))
            // 异次病发查询
            count = await this.diffParoxysmQuery(
                query,
                source,
                aggregation,
                uuid,
                from,
                size
            );
        // 标准查询
        else
            count = await this.standardQuery(
                query,
                source,
                aggregation,
                uuid,
                from,
                size
            );
        console.timeEnd("search");
        return count;
    }

    /**
     * 组装不包含异次病发的基础 wsl
     * @param {*} query the form data that use submit
     * @param {*} source the columns wsl will show
     * @param {*} size the size will es slice
     */
    packageWsl(query, source, aggregation, from = 0, size = 50) {
        let wsl = new Wsl(source, "300000ms", from, size, {});
        let q = new Bool();
        // 如果没有 or 关系的，这个参数给 1 拿不到结果
        if (query.some((c) => c.relation === "or")) q.bool.minimum_should_match = 1;
        query.forEach((condition) => {
            let occur = "must";
            if (condition.relation === "or") occur = "should";
            switch (condition.operation) {
                case "eq":
                    q.addTermTo(occur, condition.code, condition.vls);
                    break;
                case "gt":
                    q.addRangeTo(occur, condition.code, "gt", condition.vls);
                    break;
                case "gte":
                    q.addRangeTo(occur, condition.code, "gte", condition.vls);
                    break;
                case "lt":
                    q.addRangeTo(occur, condition.code, "lt", condition.vls);
                    break;
                case "lte":
                    q.addRangeTo(occur, condition.code, "lte", condition.vls);
                    break;
                case "in":
                    q.addTermsTo(occur, condition.code, condition.vls.split(","));
                    break;
                default:
                    break;
            }
        });

        wsl.body.query = q;
        if (aggregation) {
            wsl.body.size = 0;
            wsl.body.from = 0;
            wsl.body.sort = [];
            wsl.body.aggs = new Aggregation(aggregation);
        }
        return wsl;
    }

    /**
     * 标准查询
     * @param { array } query 组织好的参数数组
     */
    async standardQuery(query, source, aggregation, uuid, from, size) {
        let wsl = this.packageWsl(
            query,
            source
                .map((c) => this.splitColumnsFields(c))
                .join(",")
                .split(","),
            aggregation,
            from,
            size
        );
        let res = await this.ctx.service.es.count(wsl);
        let session = { total: res, columns: source, wsl };
        await this.ctx.service.redis.post(uuid, JSON.stringify(session));
        return res;
    }

    /**
     * 异次并发查询
     * @param { array } query 组织好的参数数组
     */
    async diffParoxysmQuery(query, source, aggregation, uuid, from, size) {
        let paroxysm_diagnosis_items = [];
        query
            .filter((d) => d.operation === "diff")
            .forEach((c) => {
                paroxysm_diagnosis_items.push(c.vls.split(","));
            });

        let hit_ipbids = await this.getParoxysmUid(paroxysm_diagnosis_items, query);
        return this.getParoxysmRecords(
            paroxysm_diagnosis_items,
            hit_ipbids,
            "ID",
            query,
            source,
            aggregation,
            uuid,
            from,
            size
        );
    }

    // 获取异次病发 id
    async getParoxysmUid(diagnosis_array_2d, formData) {
        //  mrids = [], // 不去重的 mrids
        //     paroxysm = [], // 符合异次病发的 mrid
        let hit_mrids = [], // 限制在这个范围内检索
            hit_ipbids = [], // 不要包含这些内容
            every_times_hited = [], // 每次命中的结果集
            res = []; // 结果 ipbid

        // 每组一次并发条件进行一次循环
        for (let x = 0; x < diagnosis_array_2d.length; x++) {
            const diagnosis_array_1d = diagnosis_array_2d[x];
            let wsl = this.packageWsl(
                formData,
                ["MRID", "ID"],
                undefined,
                1,
                20000000
            );
            let nestedBool = new Bool([], [], [], [], 1);
            diagnosis_array_1d.forEach((d) => {
                // 本组诊断满足一个即可
                nestedBool.addTermTo("should", "Diagnosis.InternalICDCode", d);
            });
            let nested = new Nested("Diagnosis", nestedBool);
            wsl.body.query.addNestedTo("must", nested);
            if (hit_mrids.length) {
                if (
                    !wsl.body.query.bool.filter ||
                    wsl.body.query.bool.filter.length === 0
                ) {
                    wsl.body.query.bool.filter = [
                        {
                            terms: {
                                "MRID.keyword": hit_mrids,
                            },
                        },
                    ];
                } else {
                    wsl.body.query.bool.filter.push({
                        terms: {
                            "MRID.keyword": hit_mrids,
                        },
                    });
                }
            }
            if (hit_ipbids.length) {
                if (
                    !wsl.body.query.bool.must_not ||
                    !wsl.body.query.bool.must_not.length === 0
                ) {
                    wsl.body.query.bool.must_not = [
                        new Bool([
                            {
                                terms: {
                                    "ID.keyword": hit_ipbids,
                                },
                            },
                        ]),
                    ];
                } else {
                    wsl.body.query.bool.must_not.push({
                        terms: {
                            "ID.keyword": hit_ipbids,
                        },
                    });
                }
            }
            let count = await this.ctx.service.es.count(wsl);
            if (count === 0) return [];
            let res = await this.ctx.service.es.search(wsl);
            every_times_hited.push(...res.hits.hits.map((r) => r._source));
            hit_mrids = Array.from(new Set(res.hits.hits.map((f) => f._source.MRID)));
            hit_ipbids = res.hits.hits.map((i) => i._source.ID);
        }

        hit_mrids.forEach((mrid) => {
            let tmp = every_times_hited.filter((h) => h.MRID === mrid);
            res.push(...tmp.map((m) => m.ID));
        });
        return res;
    }

    // 获取异次病发文档记录
    async getParoxysmRecords(
        diagnosis_array_2d,
        paroxysm_mrids,
        filter_fields,
        query,
        source,
        aggregation,
        uuid,
        from,
        size
    ) {
        let wsl = this.packageWsl(
            query,
            source
                .map((c) => this.splitColumnsFields(c))
                .join(",")
                .split(","),
            aggregation,
            from,
            size
        );
        // wsl.body.query.bool.minimum_should_match = 1
        // 填充 filter
        wsl.body.query.addTermsTo("filter", filter_fields, paroxysm_mrids);
        // let nestedBool = new Bool([], [], [], [], 1)
        // // 填充 should
        // for (let x = 0; x < diagnosis_array_2d.length; x++) {
        //     const diagnosis_array_1d = diagnosis_array_2d[x]
        //     let bool = new Bool([], [], [], [], 1)
        //     bool.bool.should = diagnosis_array_1d.map((d) => ({
        //         term: {
        //             'Diagnosis.InternalICDCode.keyword': d,
        //         },
        //     }))
        //     nestedBool.bool.should.push(bool)
        // }
        // let nst = new Nested('Diagnosis', nestedBool)
        // wsl.body.query.addNestedTo('should', nst)
        // return res
        let count = await this.ctx.service.es.count(wsl);
        let session = { total: count, columns: source, wsl };
        await this.ctx.service.redis.post(uuid, JSON.stringify(session));
        return count;
    }

    splitColumnsFields(c) {
        let columns = "";
        if (c.path) {
            columns = c.columns
                .split(",")
                .map((f) => c.path + "." + f)
                .join(",");
            if (c.nested_order_fields) {
                columns += `,${c.path}.${c.nested_order_fields}`;
            }
        } else columns = c.columns;
        return columns;
    }

    mapping(data_row, columns, type = "obj") {
        let row = {};
        if (type === "array") row = [];
        columns.forEach((c) => {
            let t = this.getValue(data_row, c);
            if (type === "array") row.push(t);
            else row[c.code] = t;
        });
        return row;
    }
    // 获取值
    getValue(row, col) {
        let value = "";
        if (!col.fileds_type || !col.path || col.fileds_type === "r") {
            col.columns.split(",").forEach((c, idx) => {
                let v = row[c];
                if (idx !== 0 && col.extension.show_code) v = `（${v}）`;
                value += v;
            });
        } else {
            let path_split = col.path.split(",");
            path_split.reduce((prev, cur, idx) => {
                if (idx === path_split.length - 1) {
                    if (col.fileds_type === "rf") {
                        col.columns.split(",").forEach((c, idx) => {
                            if (prev[cur]) {
                                if (prev[cur][c] !== null) {
                                    let v = prev[cur][c];
                                    if (idx !== 0 && col.extension.show_code) v = `（${v}）`;
                                    value += v;
                                }
                            }
                        });
                    } else {
                        let arr = prev[cur];
                        if (!arr) return "";
                        if (col.nested_order_fields)
                            arr.sort(
                                (x, y) =>
                                    x[col.nested_order_fields] - y[col.nested_order_fields]
                            );
                        value = arr
                            .map((r) => {
                                let t = "";
                                if (col.extension.show_code) {
                                    col.columns.split(",").forEach((c, idx) => {
                                        let v = r[c] || "";
                                        if (idx !== 0 && col.extension.show_code && v)
                                            v = `（${v}）`;
                                        t += v;
                                    });
                                } else {
                                    t = r[col.columns.split(",")[0]] || "";
                                }
                                return t;
                            })
                            .filter((x) => x)
                            .join(", ");
                    }
                } else return prev[cur];
            }, row);
        }
        if (col.formatter) value = this.fmtValue(col.formatter, value);
        return value;
    }
    // 格式化值
    fmtValue(fmt, value) {
        if (!fmt || !formatter[fmt]) return value;
        else return formatter[fmt](value);
    }
}

module.exports = QueryController;
