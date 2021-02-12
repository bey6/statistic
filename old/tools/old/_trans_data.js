const fs = require('fs');
const chalk = require('chalk')
const ora = require('ora')
const moment = require('moment')
const sqlserver = require('mssql');
const config = require('./config');
const db = require('./_db')
const es = require('./_es')

let addSerial = false
let addFulltext = false
let addInpatientInterval = true
let index = config.index
let addMoreICDInfo = true
let replaceSingleQuotes = false
let dbConfigSource = {
    server: config.dbServer,
    database: 'MR_FS_DB',
    user: 'sa',
    password: 'Docimax@123',
    options: {
        instanceName: 'dev',
        encrypt: false,
    },
};


async function getFullText(sid, pool) {
    sql = "select OCRCatalogue,OCRCatalogueID,OCRAllText from VOCR_ResultInfo where Success=1 and OCRImagePriSerialNo='" + sid + "'"
    var r = await pool.request().query(sql);
    let rd = r.recordset
    if (rd === undefined) {
        return []
    }
    return rd
}
async function getPriSerialNo(id, pool) {
    sql = "select PriSerialNo from VMDPMS_MedicalPatientBase where PBaseID='" + id + "'"
    var r = await pool.request().query(sql);
    let rd = r.recordset[0]
    if (rd === undefined) {
        return -1
    }
    return rd['PriSerialNo']
}
async function processMore(id, pool) {
    sql = "select CreateTime ,LastModifyTime from VDoctor where IPB_ID='" + id + "' and DoctorType='编码员'"

    var r = await pool.request().query(sql);
    let rd = r.recordset[0]
    if (rd === undefined) {
        return {}
    }
    let c = rd['CreateTime']
    let l = rd['LastModifyTime']
    return {
        c,
        l
    }

}
async function getInpatientInterval(mrid, admissionDateTime, hospitalizedTimes) {
    let sql = "select DischargeDateTime from VBase where CodeState=1000 and mrid='" + mrid + "' and HospitalizedTimes=" + (hospitalizedTimes--)
    var r = await pool.request().query(sql);
    let rd = r.recordset[0]
    if (rd === undefined) {
        return -1
    }
    return rd['DischargeDateTime'] - admissionDateTime //ms distance
}
async function processDoctor(
    id,
    fkey,
    table,
    typecol,
    valuecol,
    codecol,
    getConnection
) {
    data = [];
    var sql = db.getExtSql(id, fkey, table);
    var r = await getConnection().request().query(sql);

    r.recordset.forEach((d) => {
        let nd = {};
        let key = d[typecol];
        var value = d[valuecol];
        var code = d[codecol];
        nd[key + '.姓名'] = value;
        nd[key + '.编码'] = code;

        data.push(nd);
    });
    return data;
};
function additionalProcessOperate(base, r) {
    r['BeforeOperateTime'] = (r['OperateBeginTime'] - base['AdmissionDateTime']) / 3600000
    r['AfterOperateTime'] = (base['DischargeDateTime'] - r['OperateEndTime']) / 3600000
    r['OperateDuringTime'] = (r['OperateEndTime'] - r['OperateBeginTime']) / 3600000
}
function saveSubItemsCount(r, subItems, key) {
    r[key + 'Count'] = subItems.length
}
let rstr = new RegExp(",", "g");
function processInfo(element) {
    for (const key in element) {
        if (element.hasOwnProperty(key)) {
            let value = element[key];
            if (typeof (value) == 'string')
                element[key] = value.replace(rstr, config.replaceSingleQuotes);
        }
    }
}
async function getExtInfo(element, pool) {

    var id = element["ID"]


    element.Diagnosis = await db.getExt(id, "IPB_ID", "VDiagnosis", () => pool)
    element.Doctor = await processDoctor(id, "IPB_ID", "VDoctor", "DoctorType", "DoctorName", 'DoctorCode', () => pool)
    element.VAllergyDiagnosis = await db.getExt(id, "IPB_ID", "VAllergyDiagnosis", () => pool)
    element.VClinicDiagnosis = await db.getExt(id, "IPB_ID", "VClinicDiagnosis", () => pool)
    element.VContact = await db.getExt(id, "IPB_ID", "VContact", () => pool)
    element.VFee = await db.getExtWithType(id, "IPB_ID", "VFee", "FeeClassName", "FeeValue", [], () => pool)
    element.VICU = await db.getExt(id, "IPB_ID", "VICU", () => pool)
    element.VOperate = await db.getExt(id, "IPB_ID", "VOperate", () => pool, additionalProcessOperate, element)
    element.VSurgery = await db.getExt(id, "IPB_ID", "VSurgery", () => pool, additionalProcessOperate, element)
    element.VTransfer = await db.getExt(id, "IPB_ID", "VTransfer", () => pool)

    await db.processOrderBase(id, "IPB_ID", "VDiagnosis", () => pool, element, 'BaseDiagnosis', 'DiagnosisOrder')
    await db.processOrderBase(id, "IPB_ID", "VOperate", () => pool, element, 'BaseVOperate', 'OperateOrder', additionalProcessOperate)
    await db.processOrderBase(id, "IPB_ID", "VSurgery", () => pool, element, 'BaseVSurgery', 'OperateOrder', additionalProcessOperate)
    if (config.saveSubItemCount) {
        saveSubItemsCount(element, element.Diagnosis, 'Diagnosis')
        saveSubItemsCount(element, element.VAllergyDiagnosis, 'VAllergyDiagnosis')
        saveSubItemsCount(element, element.VClinicDiagnosis, 'VClinicDiagnosis')
        saveSubItemsCount(element, element.VOperate, 'VOperate')
        saveSubItemsCount(element, element.VSurgery, 'VSurgery')
        saveSubItemsCount(element, element.VICU, 'VICU')
        saveSubItemsCount(element, element.VTransfer, 'VTransfer')
        saveSubItemsCount(element, element.VContact, 'VContact')
    }
    let {
        c,
        l
    } = await processMore(id, pool)
    element['CodeTime'] = c
    element['LastModifiedTime'] = l
    let ht = element['HospitalizedTimes'];
    if (ht > 1 && addInpatientInterval) {
        let inpatientInterval = getInpatientInterval(element['mrid'], element['AdmissionDateTime'], ht)
        element['InpatientInterval'] = inpatientInterval / 1000 / 3600 //hours distance
    }
    if (addSerial) {
        let priSerialNo = await getPriSerialNo(id, pool)

        element['PriSerialNo'] = priSerialNo
    }
    if (addFulltext && priSerialNo != undefined && priSerialNo != -1) {
        let r = await getFullText(priSerialNo, pool)
        element['FullText'] = r
    }

    if (addMoreICDInfo) {
        processDocAdditionInfo(element, mappingInfos)
    }
    if (replaceSingleQuotes)
        processInfo(element)
    return element
}
let mappingInfos
const addMoreInfo = require('./_add_more_info');
function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}
async function processDocAdditionInfo(doc,
    mappingInfos) {
    try {
        await sleep(10)

        for (let i = 0; i < mappingInfos.length; i++) {
            const minfo = mappingInfos[i];
            await addMoreInfo.processdoc(
                minfo['mapping'],
                doc,
                minfo['docQueryField'],
                minfo['mapSource'],
                minfo['mapTargetList'],
                minfo['docTargetList']
            );
        }
    }
    catch (err) {
        fs.appendFileSync(`./log/processDocAdditionInfo__${moment(new Date()).format('YYYY-MM-DD')}--err.txt`, "faild:" + doc + JSON.stringify(err))
        console.log("processDocAdditionInfo faild:" + doc + err);
    }
}
let con = undefined
async function getConnection() {
    if (con == undefined) {
        sqlserver.close()
        con = await sqlserver.connect(dbConfigSource);
    }
    return con;
}

//process will continue run
translog = [] //normal process log
exceptionlog = [] //exception log
async function getData(strsql, pool) {
    let data = [];
    try {
        if (pool == undefined)
            pool = await getConnection()
        let rs = await pool.request().query(strsql);
        for (let i = 0; i < rs.recordset.length; i++) {
            let element = rs.recordset[i]
            let d = await getExtInfo(element, pool)
            data.push(d);
        }
        return data
    } catch (error) {
        console.log(error);
    } finally {
        //await pool.close();
    }

}
async function importdata(data, successFile, faildFile, update = false) {
    const spinner = ora('0 / ' + data.length).start()
    let errCount = 0
    for (let i = 0; i < data.length; i++) {
        try {
            if (update) {
                let exist = await es.getDocumentById(index, data[i]['ID'])
                if (exist !== undefined)
                    await es.deleteDocument(index, data[i]['ID'])
            }
            let r = await es.addDocument(index, data[i]['ID'], data[i])
            fs.appendFileSync(successFile, '\r\n' + data[i]['ID'] + ',')
            spinner.text = `${i} / ${data.length}`
        } catch (error) {
            errCount++
            fs.appendFileSync(`./log/importdata__${moment(new Date()).format('YYYY-MM-DD')}--error.txt`, `\r\n${JSON.stringify(error)}`)
            fs.appendFileSync(faildFile, '\r\n' + data[i]['ID'] + ',')
        }
    }
    spinner.stop()
    return errCount
}
async function importdataBulk(data) {
    if (data.length === 0) return
    let ids = []
    const spinner = ora('0 / ' + data.length).start()
    for (let i = 0; i < data.length; i++) {
        ids.push(data[i]['ID'])
    }
    let si = undefined
    try {
        let k = 0
        si = setInterval(() => {
            k++
            if (k >= data.length) clearInterval(si)
            spinner.text = `${k} / ${data.length}`
        }, 3);
        await es.addDocumentBulk(index, data, 'ID')
        fs.appendFileSync(`./log/importdataBulk__${moment(new Date()).format('YYYY-MM-DD')}--success.txt`, JSON.stringify(ids))
    } catch (err) {
        fs.appendFileSync(`./log/importdataBulk__${moment(new Date()).format('YYYY-MM-DD')}--faild.txt`, JSON.stringify(ids))
    } finally {
        spinner.stop()
        clearInterval(si)
    }
}
function getDateString(d) {
    let s = d.getFullYear().toString() + "-" +
        (d.getMonth() + 1).toString() + "-" +
        d.getDate().toString()
    return s
}
async function trandData(start, end, timeinterval) {
    console.log(chalk.blackBright(chalk.bgGreen(`本次同步范围：${getDateString(start)} ~ ${getDateString(end)}`)) + '\r\n')
    pool = await getConnection()
    mappingInfos = await addMoreInfo.getMappingInfos(pool)
    let dataPreStr = moment(new Date()).format('YYYY-MM-DD'),
        importTotal = 0
    try {
        const spinner = ora('')
        for (let d = start; d < end; d.addDays(timeinterval)) {
            let timeStart = getDateString(d),
                timeEnd = getDateString(new Date(d).addDays(timeinterval))
            spinner.start(`range: ${timeStart} / ${timeEnd}...`)
            let sql = "select * from vbase where DischargeDateTime>='" + timeStart + "' and DischargeDateTime<'" + timeEnd + "' and CodeState=1000"
            let data = await getData(sql, pool)
            spinner.stop()
            if (data !== undefined && data.length > 0) {
                importTotal += data.length
                await importdataBulk(data)
                console.log(`range: ${timeStart} / ${timeEnd} [${chalk.green(data.length)}] [${chalk.green('ok')}]`)
            } else console.log(`range: ${timeStart} / ${timeEnd} [${chalk.yellow(0)}] [${chalk.yellow('empty')}]`)
        }
        console.log(`${chalk.blueBright('total import')}: [${chalk.green(importTotal)}]\r\n`)
    } catch (err) {
        console.log(err)
        fs.appendFileSync(`./log/trandData__${dataPreStr}--err.txt`, JSON.stringify(err) + ',\r\n')
    } finally {
        await pool.close()
        con = undefined
    }
}
async function trandNewData(start, end, timeinterval) {
    console.log(chalk.blackBright(chalk.bgGreen(`本次同步范围：${getDateString(start)} ~ ${getDateString(end)}`)) + '\r\n')
    pool = await getConnection()
    mappingInfos = await addMoreInfo.getMappingInfos(pool)
    let dataPreStr = moment(new Date()).format('YYYY-MM-DD')
    let importTotal = 0
    try {
        const spinner = ora('')
        for (let d = start; d < end; d.addDays(timeinterval)) {
            let timeStart = getDateString(d),
                timeEnd = getDateString(new Date(d).addDays(timeinterval))
            spinner.start(`range: ${timeStart} / ${timeEnd}...`)
            let sql = "select * from vbase where LastModifyTime>='" + timeStart + "' and LastModifyTime<'" + timeEnd + "' and CodeState=1000"
            // console.log(sql)
            let data = await getData(sql, pool)
            spinner.stop()
            if (data !== undefined && data.length > 0) {
                importTotal += data.length
                let errc = await importdata(data, "./log/trandNewData__" + dataPreStr + "--success.txt", "./log/trandNewData__" + dataPreStr + "--faild.txt", true)
                let errstring = ''
                if (errc > 0) errstring = `[${chalk.red(errc)}] [${chalk.red('err')}]`
                console.log(`range: ${timeStart} / ${timeEnd} [${chalk.green(data.length - errc)}] [${chalk.green('ok')}] ${errstring}`)
            } else console.log(`range: ${timeStart} / ${timeEnd} [${chalk.yellow(0)}] [${chalk.yellow('empty')}]`)
        }
        console.log(`${chalk.blueBright('total import')}: [${chalk.green(importTotal)}]\r\n`)
    } catch (err) {
        console.log(err)
        fs.appendFileSync(`./log/trandNewData__${dataPreStr}--err.txt`, JSON.stringify(err) + ',\r\n')
    } finally {
        await pool.close()
        con = undefined
    }
}

module.exports = {
    /**
     * 全数据修复(按照 LastModifyTime 更新)
     * @param { Date } start 开始日期
     * @param { Date } end 结束日期
     */
    DataRepair: async (start, end) => {
        // await trandNewData(start, end, 1)
        await trandData(start, end, 1)
    },
    /**
     * 近几周数据更新同步(按照 LastModifyTime 更新)
     * @param { Date } start 开始日期
     * @param { Date } end 结束日期
     * @param { Boolean } byModifyTime 按照更改时间
     */
    DataUpdate: async (start, end, byModifyTime = true) => {
        if (byModifyTime) await trandNewData(start, end, 1)
        else await trandData(start, end, 1)
    }
}