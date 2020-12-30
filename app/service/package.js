const mssql = require('mssql')
const { Service } = require('egg')

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

class PackageService extends Service {

    async search(page) {
        return new Promise((resolve, reject) => {
            try {
                let tsql = `select * from (
                    select id, name, owner, createTime, description, ROW_NUMBER() OVER(ORDER BY createTime desc) as rn from table_model
                    ) as t 
                    where t.rn > ${(page - 1) * 20} and t.rn <= ${page * 20}`
                mssql.connect(config, (err) => {
                    if (err) {
                        console.trace(err.message)
                        reject(err)
                    } else {
                        let request = new mssql.Request()
                        request.query(tsql, (err, res) => {
                            if (err) {
                                console.trace(err.message)
                                reject(err)
                            } else {
                                request.query('select count(1) as total from table_model', (err, rc) => {
                                    if (err) {
                                        console.trace(err.message)
                                        reject(err)
                                    } else {
                                        resolve({ total: rc.recordset[0].total, list: res.recordset })
                                    }
                                })
                            }
                        })

                    }
                })
            } catch (error) {
                console.trace(error.message)
                reject(error)
            }
        })
    }

}

module.exports = PackageService