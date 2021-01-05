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
            let resTotal = await pool
                .request()
                .query('select count(1) as total from table_model')
            return {
                total: resTotal.recordset[0].total,
                list: resData.recordset,
            }
        } catch (error) {
            console.log('???')
            console.log(error.message)
            return error
        } finally {
            mssql.close()
        }
    }

    /**
     * 添加查询任务
     * @param { string } search_id 查询任务ID
     * @param { string } name 任务名称
     */
    async addSearchTask(search_id, name) {
        try {
            let pool = await mssql.connect(config)
            let res = await pool
                .request()
                .input('input_search_id', mssql.VarChar(50), search_id)
                .input('input_name', name)
                .input(
                    'input_date',
                    mssql.DateTime,
                    moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
                )
                .input('input_status', mssql.VarChar(10), 'running')
                .query(
                    'insert into table_searchTask (SearchId, Name, CreateDate, Status, IsRead) values (@input_search_id, @input_name, @input_date, @input_status, 0)'
                )
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }

    async getSearchTask() {
        try {
            let pool = await mssql.connect(config)
            let res = await pool
                .request()
                .query(
                    'select SearchId, Name, Status, CreateDate, IsRead from table_searchTask order by IsRead, CreateDate desc'
                )
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }

    async getSearchTaskUnread() {
        try {
            let pool = await mssql.connect(config)
            let res = await pool
                .request()
                .query(
                    'select SearchId, Name, Status, CreateDate, IsRead from table_searchTask where status=\'completed\' and (isread=0 or isread is null)'
                )
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
    async putSearchTaskStatus(search_id, status) {
        try {
            let pool = await mssql.connect(config)
            let res = await pool
                .request()
                .input('input_search_id', mssql.VarChar(50), search_id)
                .input('input_status', mssql.VarChar(10), status)
                .query(
                    'update table_searchTask set Status=@input_status where SearchId=@input_search_id'
                )
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }

    /**
     * update the search task to readed
     * @param { string } search_id search id
     */
    async putSearchTaskRead(search_id) {
        try {
            let pool = await mssql.connect(config)
            let res = await pool
                .request()
                .input('input_search_id', mssql.VarChar(50), search_id)
                .query(
                    'update table_searchTask set isread=1 where SearchId=@input_search_id'
                )
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }

    /**
     * update the search task name
     * @param { string } search_id search id
     * @param { string } name task name
     */
    async putSearchTaskName(search_id, name) {
        try {
            let pool = await mssql.connect(config)
            let res = await pool
                .request()
                .input('input_search_id', mssql.VarChar(50), search_id)
                .input('input_name', name)
                .query(
                    'update table_searchTask set Name=@input_name where SearchId=@input_search_id'
                )
            return res
        } catch (error) {
            return error
        } finally {
            mssql.close()
        }
    }
}

module.exports = MrqueryService
