const mssql = require('mssql')
const { Service } = require('egg')
const moment = require('moment')

// mssql 配置
const config = {
    server: '172.30.199.163',
    user: 'sa',
    password: 'Docimax@123',
    database: 'MRFSQuery',
    options: {
        instanceName: 'dev',
        encrypt: false,
    },
}

class MrqueryService extends Service {

    async search(page) {
        try {
            let tsql = `select * from (
        select id, name, owner, createTime, description, ROW_NUMBER() OVER(ORDER BY createTime desc) as rn from table_model
        ) as t 
        where t.rn > ${(page - 1) * 20} and t.rn <= ${page * 20}`
            let pool = await mssql.connect(config)
            let resData = await pool.request().query(tsql)
            let resTotal = await pool.request().query('select count(1) as total from table_model')
            return { total: resTotal.recordset[0].total, list: resData.recordset }
        } catch (error) {
            console.log('???')
            console.log(error.message)
            return error
        } finally {
            mssql.close()
        }
    }

    async addSearchTask(search_id, name) {
        try {
            let pool = await mssql.connect(config)
            let res = await pool.request()
                .input('input_search_id', mssql.VarChar(50), search_id)
                .input('input_name', mssql.VarChar(100), name)
                .input('input_date', mssql.DateTime, moment(new Date()).format('YYYY-MM-DD hh:mm:ss'))
                .query('insert into table_searchTask (SearchId, Name, CreateDate) values (@input_search_id, @input_name, @input_date)')
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }

    // async delSearchTask(searchId) {
    //     // select SearchId, Name, CreateDate from table_SearchTask
    // }

    async getSearchTask() {
        try {
            let pool = await mssql.connect(config)
            let res = await pool.request()
                .query('select SearchId, Name, Status, CreateDate from table_searchTask')
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }

    /**
     * update the search task running status
     * @param { string } search_id search id
     * @param { string } status task status
     */
    async putSearchTask(search_id, status) {
        try {
            let pool = await mssql.connect(config)
            let res = await pool.request()
                .input('input_search_id', mssql.VarChar(50), search_id)
                .input('input_status', mssql.VarChar(10), status)
                .query('update table_searchTask set Status=@input_status where SearchId=@input_search_id')
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }
}

module.exports = MrqueryService