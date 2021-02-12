let fs = require('fs');
const chalk = require('chalk')
let sqlserver = require('mssql');
const config = require('./config')
const esindex = config.index;

let DiagnosisIcdMappingSql =
    'select * from Map_Diagnosis where ICDVersionID=3 and TargetVersionID=10';
let MorphologyIcdMappingSql =
    'select * from Map_Morphology where ICDVersionID=4 and TargetVersionID=12';
let OperateIcdMappingSql =
    'select * from Map_Operate where ICDVersionID=5 and TargetVersionID=11';

let dbConfigSource = {
    server: config.dbServer,
    database: 'MR_FS_DB',
    user: 'sa',
    password: 'Docimax@123',
    port: 1433,
};
let db = require('./_db');
var es = require('./_es');
let con = undefined;
async function getConnection() {
    //if (con == undefined) {
    sqlserver.close();
    con = await sqlserver.connect(dbConfigSource);
    //}
    return con;
}

async function getMapping(sql, pool = undefined) {
    let tp = undefined;
    if (pool != undefined) tp = pool;
    else tp = await getConnection();
    //let pool = await getConnection();
    let r = await tp.request().query(sql);
    let mapping = [];
    let rs = r.recordset;
    for (let index = 0; index < rs.length; index++) {
        const element = rs[index];
        mapping.push(element);
    }
    if (pool == undefined)
        await tp.close();
    return mapping;
}
missingkeys = [];
async function processmapping(
    mappingTable,
    id,
    doc,
    docSource,
    mapSource,
    mapTargetList,
    targetDocFieldList
) {
    if (targetDocFieldList.length !== mapTargetList.length)
        throw new Error('mismatch fields length');
    let items = docSource.split('.');
    let targetdocs = doc[items[0]];

    console.log(items[0]);
    for (let i = 0; i < targetdocs.length; i++) {
        const element = targetdocs[i];
        let key = element[items[1]];
        // if (isnull(key))
        //   console.log(element);
        let map = mappingTable.filter((v) => v[mapSource] === key);

        if (map === undefined || map.length === 0) {
            missingkeys.push(key);
            console.log('missing mapping:' + key);
            console.log(element);
            return;
        }
        console.log(map);
        console.log(mapTargetList.length);
        for (let index = 0; index < mapTargetList.length; index++) {
            const mapField = mapTargetList[index];
            const targetField = targetDocFieldList[index];
            console.log(map[0][mapField]);
            element[targetField] = map[0][mapField];
        }
    }

    await es.modifyDocument(esindex, id, doc);
}
async function getdocuments(start, end, field) {
    let ss = {
        query: {
            range: {},
        },
    };
    console.log("loading documents:" + start + "-----" + end);
    ss['query']['range'][field] = { gte: start, lte: end };
    //console.log(JSON.stringify(ss));
    let docs = await es.search(esindex, ss);
    //console.log(docs);
    console.log("get docs:" + docs.length);
    return docs;
}
function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function addDocInfo(
    start,
    end,
    limit,
    sql,
    docSource,
    mapSource,
    mapTargetList,
    docTargetList
) {
    let Mapping = await getMapping(sql);

    for (let d = start; d < end; d.addDays(limit)) {
        let s = new Date(d);
        let e = new Date(d);

        let docs = await getdocuments(s, e.addDays(limit), 'DischargeDateTime');
        missingkeys = [];
        if (docs !== undefined)
            for (let index = 0; index < docs.length; index++) {
                const d = docs[index];
                try {
                    await sleep(timedelay)
                    console.log("process doc with id:" + d['_id']);

                    await processmapping(
                        Mapping,
                        d['_id'],
                        d['_source'],
                        docSource,
                        mapSource,
                        mapTargetList,
                        docTargetList
                    );
                    console.log("process doc with id finished:" + d['_id']);
                }
                catch (err) {
                    missingkeys.push(d['_id']);
                    console.log("faild:" + d['_id'] + err);
                }
            }


    }
    fs.readFileSync("faild.json", JSON.stringify(missingkeys))
    console.log(missingkeys);
}
module.exports.processdoc = async function processdoc(
    mappingTable,
    doc,
    docSource,
    mapSource,
    mapTargetList,
    targetDocFieldList
) {
    if (targetDocFieldList.length !== mapTargetList.length)
        throw new Error('mismatch fields length');
    let items = docSource.split('.');
    let targetdocs = doc[items[0]];
    for (let i = 0; i < targetdocs.length; i++) {
        const element = targetdocs[i];
        let key = element[items[1]];
        // if (isnull(key))
        //   console.log(element);
        let map = mappingTable.filter((v) => v[mapSource] === key);

        if (map === undefined || map.length === 0) {
            //missingkeys.push(key + ':' + items[1]);
            //fs.appendFileSync("faild.json", "missing mapping:" + key)
            //console.log('missing mapping:' + key);
            // console.log(element);
            // console.log(items[1]);
            return;
        }
        for (let index = 0; index < mapTargetList.length; index++) {
            const mapField = mapTargetList[index];
            const targetField = targetDocFieldList[index];

            element[targetField] = map[0][mapField];
        }
    }


}

//mappingInfos is an array of
//  {mapping
// docQueryField,
// mapSource,
// mapTargetList,
// docTargetList}

async function processDocInfo(
    docs,
    mappingInfos
) {
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        try {
            await sleep(timedelay)
            console.log("process doc with id:" + d['_id']);
            for (let i = 0; i < mappingInfos.length; i++) {
                const minfo = mappingInfos[i];
                await module.exports.processdoc(
                    minfo['mapping'],
                    d['_source'],
                    minfo['docQueryField'],
                    minfo['mapSource'],
                    minfo['mapTargetList'],
                    minfo['docTargetList']
                );
            }

            await es.modifyDocument(esindex, d['_id'], d['_source']);
            console.log("process doc with id finished:" + d['_id']);
        }
        catch (err) {
            //missingkeys.push(d['_id']);
            fs.appendFileSync("faild.json", "faild:" + d['_id'] + JSON.stringify(err))
            console.log("faild:" + d['_id'] + err);
        }
    }


}

async function importDocInfo(s, e) {
    await addDocInfo(
        s,
        e,
        10,
        DiagnosisIcdMappingSql,
        'Diagnosis.DiagnosisICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['GBICDCode', 'GBICDName']
    );
    await addDocInfo(
        s,
        e,
        1,
        DiagnosisIcdMappingSql,
        'VAllergyDiagnosis.DiagnosisICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['GBICDCode', 'GBICDName']
    );
    await addDocInfo(
        s,
        e,
        1,
        DiagnosisIcdMappingSql,
        'VClinicDiagnosis.DiagnosisICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['GBICDCode', 'GBICDName']
    );
    await addDocInfo(
        s,
        e,
        1,
        MorphologyIcdMappingSql,
        'Diagnosis.PathologyICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['PathologyGBICDCode', 'PathologyGBICDName']
    );
    await addDocInfo(
        s,
        e,
        1,
        MorphologyIcdMappingSql,
        'VAllergyDiagnosis.PathologyICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['PathologyGBICDCode', 'PathologyGBICDName']
    );
    await addDocInfo(
        s,
        e,
        1,
        MorphologyIcdMappingSql,
        'VClinicDiagnosis.PathologyICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['PathologyGBICDCode', 'PathologyGBICDName']
    );

    await addDocInfo(
        s,
        e,
        1,
        OperateIcdMappingSql,
        'VOperate.OperateICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['GBICDCode', 'GBICDName']
    );
    await addDocInfo(
        s,
        e,
        1,
        OperateIcdMappingSql,
        'VSurgery.OperateICDCode',
        'ICDCode',
        ['TargetICDCode', 'TargetICDName'],
        ['GBICDCode', 'GBICDName']
    );
}
module.exports.getMappingInfos = async function getMappingInfos(pool = undefined) {
    console.log('prepare mapping');
    let diagnosisMapping = await getMapping(DiagnosisIcdMappingSql, pool)
    console.log('diagnosis mapping [' + chalk.green('ok') + ']');
    let morphologyMapping = await getMapping(MorphologyIcdMappingSql, pool)
    console.log('morphology mapping [' + chalk.green('ok') + ']');
    let operateMapping = await getMapping(OperateIcdMappingSql, pool)
    console.log('operate mapping [' + chalk.green('ok') + ']');
    console.log()
    let mappingInfos = [
        {
            mapping: diagnosisMapping,
            docQueryField: 'Diagnosis.DiagnosisICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['DiagnosisGBICDCode', 'DiagnosisGBICDName']
        },
        {
            mapping: diagnosisMapping,
            docQueryField: 'VAllergyDiagnosis.DiagnosisICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['DiagnosisGBICDCode', 'DiagnosisGBICDName']
        },
        {
            mapping: diagnosisMapping,
            docQueryField: 'VClinicDiagnosis.DiagnosisICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['DiagnosisGBICDCode', 'DiagnosisGBICDName']
        },
        {
            mapping: morphologyMapping,
            docQueryField: 'Diagnosis.PathologyICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['PathologyGBICDCode', 'PathologyGBICDName']
        },
        {
            mapping: morphologyMapping,
            docQueryField: 'VAllergyDiagnosis.PathologyICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['PathologyGBICDCode', 'PathologyGBICDName']
        },
        {
            mapping: morphologyMapping,
            docQueryField: 'VClinicDiagnosis.PathologyICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['PathologyGBICDCode', 'PathologyGBICDName']
        },
        {
            mapping: operateMapping,
            docQueryField: 'VOperate.OperateICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['OperateGBICDCode', 'OperateGBICDName']
        },
        {
            mapping: operateMapping,
            docQueryField: 'VSurgery.OperateICDCode',
            mapSource: 'ICDCode',
            mapTargetList: ['TargetICDCode', 'TargetICDName'],
            docTargetList: ['OperateGBICDCode', 'OperateGBICDName']
        }
    ]
    return mappingInfos
}
async function importDocInfos(start, end, limit) {

    let mappingInfos = await module.exports.getMappingInfos()
    for (let d = start; d < end; d.addDays(limit)) {
        let s = new Date(d);
        let e = new Date(d);

        let docs = await getdocuments(s, e.addDays(limit), 'DischargeDateTime');

        await processDocInfo(docs, mappingInfos)


    }
}
let timedelay = 50
let importstartTime = new Date(1900, 10, 1);
let importendTime = new Date(2020, 1, 1);

let start = new Date()
//importDocInfos(importstartTime, importendTime, 10)
//fs.writeFileSync("faild.json", 'JSON.stringify(missingkeys)')
//console.log(new Date() - start);