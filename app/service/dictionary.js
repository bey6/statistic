const mssql = require('mssql')
const { Service } = require('egg')

// mssql 配置
const mrfs_db = {
    server: '172.30.199.163',
    user: 'sa',
    password: 'Docimax@123',
    database: 'MR_FS_DB',
    options: {
        instanceName: 'dev',
        encrypt: false,
    },
}
const security_db = {
    server: '172.30.199.163',
    user: 'sa',
    password: 'Docimax@123',
    database: 'MR_FS_DB',
    options: {
        instanceName: 'dev',
        encrypt: false,
    },
}
class DictionaryService extends Service {

    async search(db, keywords) {
        return new Promise((resolve, reject) => {
            try {
                let tsql = 'select internalIcdName as name, internalIcdCode as code from dic_icd_internal_diagnosis where (deleted is null or deleted=0) ',
                    result = []
                if (keywords) {
                    tsql += `and (
                        (internalIcdCode='${keywords}' or internalIcdCode like '${keywords}%') or    
                        (internalIcdPinyinCode='${keywords}' or internalIcdPinyinCode like '${keywords}%') or
                        (internalIcdName='${keywords}' or internalIcdName like '${keywords}%')
                        )`
                }
                console.log(tsql)
                let config = ''
                if (db === 'mrfs') config = mrfs_db
                else config = security_db
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
                                result = res.recordset
                                resolve(result)
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

module.exports = DictionaryService