/**
 * [dbo].[FS_InPatientBase] 住院
 * [dbo].[FS_InpatientContact] 联系人
 * [dbo].[FS_InPatientDiagnosis] 诊断
 * [dbo].[FS_InPatientOperation] 手术/操作
 * [dbo].[FS_InPatientDoctor] 医生
 * [dbo].[FS_InPatientFee] 费用
 * [dbo].[FS_InPatientICU] icu
 * [dbo].[FS_InpatientTransfer] 转科
 */

const sql = require('mssql')
const elasticsearch = require('elasticsearch')
const moment = require('moment')
const mapping = require('./mapping')
const fs = require('fs')

const client = new elasticsearch.Client({
    host: '172.30.199.166:9200',
    index: 'bei',
    // log: 'trace',
    apiVersion: '7.6',
})

// mssql 配置
const config = {
    server: '172.30.199.163',
    user: 'sa',
    password: 'Docimax@123',
    database: 'MR_FS_DB',
    options: {
        instanceName: 'dev',
        encrypt: false,
    },
}

/**
 * 获取指定时间内的数据 ID，返回一个字符串数组，类似 ['id1', 'id2', 'id3']
 * @param { string } startDate YYYY-MM-DD
 * @param { string } endDate YYYY-MM-DD
 * @param { string } dateFields 默认为 dischargeDateTime
 */
function getThisRangeDataIds(
    startDate,
    endDate,
    dateFields = 'dischargeDateTime'
) {
    return new Promise((resolve, reject) => {
        try {
            let tsql = `select id from fs_inPatientBase where codeState=1000 and (deleted is null or deleted = 0)
and ${dateFields} >= '${startDate}' and ${dateFields} < '${endDate}'`,
                result = []
            sql.connect(config, (err) => {
                if (err) {
                    console.trace(err.message)
                    reject(err)
                } else {
                    let request = new sql.Request()
                    request.query(tsql, (err, res) => {
                        if (err) {
                            console.trace(err.message)
                            reject(err)
                        } else {
                            result = res.recordset.map((r) => r.id)
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

/**
 * 组装住院信息
 * @param { array } items 住院信息
 */
function assembleBase(items) {
    if (items.length > 1)
        items.sort((x, y) => x.LastModifyTime - y.LastModifyTime)
    let obj = items[0]
    return {
        mrid: obj.MRID,
        consult_number: obj.ConsultintNum, // 就诊号
        hospitalized_times: obj.HospitalizedTimes, // 住院次数
        hospitalized_days: obj.InpatientDay, // 住院天数
        health_card: obj.HealthCard,
        patient_id: obj.PatientID,
        patient_name: obj.PatientName,
        birthday: obj.Birthday,
        age: obj.Age,
        newborn_year: obj.Newborn_Year,
        newborn_month: obj.NewBorn_Month,
        newborn_day: obj.NewBorn_Day,
        newborn_hour: obj.NewBorn_Hour,
        newborn_weight: obj.NewBorn_Weight,
        newborn_adm_weight: obj.Newborn_AdmissionWeight,
        nation_code: obj.NationCode,
        nation_name: obj.Nation, // 民族
        nationality_code: obj.NationalityCode,
        nationality_name: obj.Nationality, // 国籍
        gender_code: obj.GenderCode,
        gender_name: obj.Gender, // 性别
        idcard: obj.IDCard, // 证件号码
        idcard_type_code: obj.IdTypeCode,
        idcard_type_name: obj.IdType, // 证件类型
        vocation_code: obj.VocationCode,
        vocation_name: obj.Vocation, // 职业
        marriage_code: obj.MarriageCode,
        marriage_name: obj.Marriage, // 结婚
        phone_number: obj.PhoneNum,
        current_province_code: obj.CurrentProvinceCode, // 现住地
        current_province_name: obj.CurrentProvince,
        current_city_code: obj.CurrentCityCode,
        current_city_name: obj.CurrentCity,
        current_area_code: obj.CurrentAreaCode,
        current_area_name: obj.CurrentArea,
        current_address: obj.CurrentAddressDetail,
        current_postcode: obj.CurrentPostCode,
        hk_province_code: obj.HukouProvinceCode, // 户口
        hk_province_name: obj.HukouProvince,
        hk_city_code: obj.HukouCityCode,
        hk_city_name: obj.HukouCity,
        hk_area_code: obj.HukouAreaCode,
        hk_area_name: obj.HukouArea,
        hk_address: obj.HukouAddressDetail,
        hk_postcode: obj.HukouPostCode,
        birth_province_code: obj.BirthProvinceCode, // 出生
        birth_province_name: obj.BirthProvince,
        birth_city_code: obj.BirthCityCode,
        birth_city_name: obj.BirthCity,
        birth_area_code: obj.BirthAreaCode,
        birth_area_name: obj.BirthArea,
        native_province_code: obj.NativeProvinceCode, // 户籍
        native_province_name: obj.NativeProvince,
        native_city_code: obj.NativeCityCode,
        native_city_name: obj.NativeCity,
        work_name: obj.WorkUnit, // 公司
        work_phone: obj.WorkTelephone,
        work_postcode: obj.WorkPostcode,
        payment_type_code: obj.PaymentTypeCode,
        payment_type_name: obj.PaymentType,
        in_datetime: obj.AdmissionDateTime, // 入院
        in_department_code: obj.InDepartCode,
        in_department_name: obj.InDepart,
        in_sickroom_code: obj.InSickRoomCode,
        in_sickroom_name: obj.InSickRoom,
        in_path_code: obj.AdmissionPathCode,
        in_path_name: obj.AdmissionPath, // 入院途径
        out_datetime: obj.DischargeDateTime, // 出院
        out_department_code: obj.OutDepartCode,
        out_department_name: obj.OutDepart,
        out_sickroom_code: obj.OutSickRoomCode,
        out_sickroom_name: obj.OutSickRoom,
        out_path_code: obj.DischargePathCode,
        out_path_name: obj.DischargePath, // 离院方式
        quality_doctor_date: obj.QualityDate1,
        // quality_doctor_name: obj.,
        // quality_doctor_code: obj., // 质控医生 (没有在这个表里，会在 doctor 中体现)
        quality_nurse_date: obj.QualityDate2,
        // quality_nurse_name: obj.,
        // quality_nurse_code: obj., // 质控护士 (没有在这个表里，会在 doctor 中体现)
        emergency_code: obj.CriticalMRCode, // 危急重病例
        emergency_name: obj.CriticalMR,
        difficult_code: obj.IntractableMRCode,
        difficult_name: obj.IntractableMR, // 疑难病例
        rescue_times: obj.RescueTime, // 抢救次数
        rescue_success_times: obj.RescueSuccessTime, // 抢救成功次数
        followup_code: obj.FollowUpCode, // 随诊
        followup_name: obj.FollowUp,
        followup_term: obj.FollowTerm, // 随诊期限，比如 长期 什么的
        followup_week: obj.FollowUpWeek,
        followup_month: obj.FollowUpMonth,
        followup_year: obj.FollowUpYear,
        is_allergy_code: obj.IsDrugAllergyCode, // 是否过敏
        is_allergy_name: obj.IsDrugAllergy, // 是否过敏
        allergy_code: obj.AllergyDrug, // 过敏信息
        allergy_name: obj.AllergyDrug, // 过敏信息
        autopsy_code: obj.AutopsyCode,
        autopsy_name: obj.Autopsy, // 尸检
        blood_type_code: obj.ABOCode,
        blood_type_name: obj.ABO, // 血型
        rh_blood_type_code: obj.RhCode, // rh 血型
        rh_blood_type_name: obj.Rh, // rh 血型
        mr_quality_code: obj.MRQuantityCode,
        mr_quality_name: obj.MRQuantity, // 病案质量
        o31i_code: obj.ReadmissionIn31Code,
        o31i_name: obj.ReadmissionIn31, // 出院31天内再住院计划
        o31i_purpose: obj.ReadmissionIn31Aim, // 出院31天内再住院目的
        coma_before_day: obj.DCPCIBeforeDay,
        coma_before_hour: obj.DCPCIBeforeHour,
        coma_before_minute: obj.DCPCIBeforeMinute, // 颅脑损伤患者昏迷时间
        coma_after_day: obj.DCPCIAfterDay,
        coma_after_hour: obj.DCPCIAfterHour,
        coma_after_minute: obj.DCPCIAfterMinute, // 颅脑损伤患者昏迷时间
        respirator_time: obj.RespiratorTime, // 呼吸机使用时间
        adl_before: obj.ADLBefore, // 日常生活能力评分
        adl_after: obj.ADLAfter,
        total_cost: obj.Totalcost, // 总金额
        self_payment: obj.SelfPayment, // 自付费
        tumour_t_code: obj.TCode, // 肿瘤 T(肿瘤) T1, T2 ..
        tumour_t_name: obj.T,
        tumour_n_code: obj.NCode, // 肿瘤 N(淋巴结) N1, N2 ..
        tumour_n_name: obj.N,
        tumour_m_code: obj.MCode, // 肿瘤 M(转移) M1, M2 ..
        tumour_m_name: obj.M,
        tumour_clinic_code: obj.TumorclinicalCode,
        tumour_clinic_name: obj.Tumorclinical, // 肿瘤分期临床分级  I II III ...
        last_modify_time: obj.LastModityTime, // 最后修改日期
        mr_work_type: obj.MRWorkType, // 病案加工类型 ??
        is_new: obj.NewlyBuild, // 新建
        data_source: obj.DataSource, // 数据来源
    }
}

/**
 * 组装联系人信息
 * @param { array } items 联系人列表
 */
function assembleContact(items) {
    if ((items.length = 0)) return []
    return items.map((c) => ({
        name: c.ContactName,
        address: c.Adress,
        phone_number: c.PhoneNum,
        relation_code: c.RelationCode,
        relation_name: c.Relation,
    }))
}

/**
 * 组装临床诊断
 * @param { array } diagnosis 诊断
 * @param { array } operation 手术/操作
 */
function assembleClinical(diagnosis, operation, mrid, times) {
    // 诊断类别 100:入院诊断 200:出院诊断 300:门急诊诊断 400:过敏药物 500:医院感染
    let process_diagnosis = (type) => {
        return diagnosis
            .filter((a) => a.DiagnosisType === type)
            .map((b) => ({
                sequence: b.DiagnosisOrder,
                mrid,
                times,
                name: b.ClinicDiagnosis,
            }))
            .filter((c) => c.name)
            .map((d, idx) => ({
                sequence: idx + 1,
                name: d.name,
            }))
    }
    // 手术操作类别  100:手术 200:操作
    let process_operation = (type) => {
        return operation
            .filter((a) => a.OperateType === type)
            .map((b) => ({
                sequence: b.OperateOrder,
                mrid,
                times,
                name: b.ClinicalOperateName,
            }))
            .filter((c) => c.name)
            .map((d, idx) => ({
                sequence: idx + 1,
                name: d.name,
            }))
    }
    return {
        in_diagnosis: process_diagnosis(100),
        out_diagnosis: process_diagnosis(200),
        emergency_diagnosis: process_diagnosis(300),
        allergy_diagnosis: process_diagnosis(400),
        infect_diagnosis: process_diagnosis(500),
        surgery: process_operation(100),
        operation: process_operation(200),
    }
}

/**
 * 组装协和诊断
 * @param { array } diagnosis 诊断
 * @param { array } operation 手术/操作
 */
function assemblePumch(diagnosis, operation, mrid, times) {
    // 诊断类别 100:入院诊断 200:出院诊断 300:门急诊诊断 400:过敏药物 500:医院感染
    let process_diagnosis = (type, fileds) => {
        return diagnosis
            .filter((a) => a.DiagnosisType === type)
            .map((b) => ({
                sequence: b.DiagnosisOrder,
                mrid,
                times,
                code: b[`${fileds}ICDCode`],
                name: b[`${fileds}ICDName`],
                admitted_code: b.AdmittedCode, // 入院病情
                admitted_name: b.Admitted,
                effect_code: b.DischargeStateCode,
                effect_name: b.DischargeState, // 疗效
                // pathology_code: b.PathologyNum,
                pathology_name: b.PathologyNum,
                according_code: b.DiagnosticbasisCode,
                according_name: b.Diagnosticbasis,
                diff_code: b.DifferentiationCode,
                diff_name: b.Differentiation,
            }))
            .filter((c) => c.name)
            .map((d, idx) => ({
                ...d,
                sequence: idx + 1,
            }))
    }
    // 手术操作类别  100:手术 200:操作
    let process_operation = (type) => {
        return operation
            .filter((a) => a.OperateType === type)
            .map((b) => ({
                sequence: b.OperateOrder,
                mrid,
                times,
                code: b.OperateICDCode,
                name: b.OperateICDName,
                start_time: b.OperateBeginTime,
                end_time: b.OperateEndTime,
                surgeon_code: b.OperatorCode,
                surgeon_name: b.OperatorName,
                i_assistant_code: b.FirstAssistantSurgeonCode,
                i_assistant_name: b.FirstAssistantSurgeon,
                ii_assistant_code: b.SecondAssistantCode,
                ii_assistant_name: b.SecondAssistantName,
                anesthesia_mode_code: b.AnesthesiaTypeCode,
                anesthesia_mode_name: b.AnesthesiaType,
                anaesthetist_code: b.AnesthesiologistCode,
                anaesthetist_name: b.Anesthesiologist,
                anesthesia_grade_code: b.AnesthesiaLevelCode,
                anesthesia_grade_name: b.AnesthesiaLevel,
                heal_grade_code: b.CicatrizeCode,
                heal_grade_name: b.Cicatrize,
                surgery_grade_code: b.OperateLevelCode,
                surgery_grade_name: b.OperateLevel,
            }))
            .filter((c) => c.name)
            .map((d, idx) => ({
                ...d,
                sequence: idx + 1,
            }))
    }
    return {
        in_diagnosis: process_diagnosis(100, 'Internal'),
        out_diagnosis: process_diagnosis(200, 'Internal'),
        out_injury_diagnosis: process_diagnosis(200, 'InternalInjuryI'),
        out_pathology_diagnosis: process_diagnosis(200, 'InternalPathology'),
        emergency_diagnosis: process_diagnosis(300, 'Internal'),
        allergy_diagnosis: process_diagnosis(400, 'Internal'),
        infect_diagnosis: process_diagnosis(500, 'Internal'),
        surgery: process_operation(100),
        operation: process_operation(200),
    }
}

/**
 * 组装北京诊断
 * @param { array } diagnosis 诊断
 * @param { array } operation 手术/操作
 */
function assembleBeijing(diagnosis, operation, mrid, times) {
    // 诊断类别 100:入院诊断 200:出院诊断 300:门急诊诊断 400:过敏药物 500:医院感染
    let process_diagnosis = (type, fileds) => {
        return diagnosis
            .filter((a) => a.DiagnosisType === type)
            .map((b) => ({
                sequence: b.DiagnosisOrder,
                mrid,
                times,
                code: b[`${fileds}ICDCode`],
                name: b[`${fileds}ICDName`],
                admitted_code: b.AdmittedCode, // 入院病情
                admitted_name: b.Admitted,
                effect_code: b.DischargeStateCode,
                effect_name: b.DischargeState, // 疗效
                // pathology_code: b.PathologyNum,
                pathology_name: b.PathologyNum,
                according_code: b.DiagnosticbasisCode,
                according_name: b.Diagnosticbasis,
                diff_code: b.DifferentiationCode,
                diff_name: b.Differentiation,
            }))
            .filter((c) => c.name)
            .map((d, idx) => ({
                ...d,
                sequence: idx + 1,
            }))
    }
    // 手术操作类别  100:手术 200:操作
    let process_operation = (type) => {
        return operation
            .filter((a) => a.OperateType === type)
            .map((b) => ({
                sequence: b.OperateOrder,
                mrid,
                times,
                code: b.OperateICDCode,
                name: b.OperateICDName,
                start_time: b.OperateBeginTime,
                end_time: b.OperateEndTime,
                surgeon_code: b.OperatorCode,
                surgeon_name: b.OperatorName,
                i_assistant_code: b.FirstAssistantSurgeonCode,
                i_assistant_name: b.FirstAssistantSurgeon,
                ii_assistant_code: b.SecondAssistantCode,
                ii_assistant_name: b.SecondAssistantName,
                anesthesia_mode_code: b.AnesthesiaTypeCode,
                anesthesia_mode_name: b.AnesthesiaType,
                anaesthetist_code: b.AnesthesiologistCode,
                anaesthetist_name: b.Anesthesiologist,
                anesthesia_grade_code: b.AnesthesiaLevelCode,
                anesthesia_grade_name: b.AnesthesiaLevel,
                heal_grade_code: b.CicatrizeCode,
                heal_grade_name: b.Cicatrize,
                surgery_grade_code: b.OperateLevelCode,
                surgery_grade_name: b.OperateLevel,
            }))
            .filter((c) => c.name)
            .map((d, idx) => ({
                ...d,
                sequence: idx + 1,
            }))
    }
    return {
        in_diagnosis: process_diagnosis(100, 'Diagnosis'),
        out_diagnosis: process_diagnosis(200, 'Diagnosis'),
        out_injury_diagnosis: process_diagnosis(200, 'ExternalInjur'),
        out_pathology_diagnosis: process_diagnosis(200, 'Pathology'),
        emergency_diagnosis: process_diagnosis(300, 'Diagnosis'),
        allergy_diagnosis: process_diagnosis(400, 'Diagnosis'),
        infect_diagnosis: process_diagnosis(500, 'Diagnosis'),
        surgery: process_operation(100),
        operation: process_operation(200),
    }
}

/**
 * 组装医生
 * @param { array } items 医生列表
 */
function assembleDoctor(items) {
    let shell = {},
        keys = Object.keys(mapping.doctor)
    if (items.length === 0) return shell

    // 去重，多个同类型的医生时取最新(lastModifyTime)的一条为准
    keys.forEach((key) => {
        let res = items.filter((d) => d.DoctorType === key)
        if (res.length > 1) {
            res.sort((x, y) => x.LastModifyTime - y.LastModifyTime)
            for (let i = 1; i < res.length; i++) {
                let idx = items.findIndex((d) => d.ID === res[i].ID)
                if (idx !== -1) items.splice(idx, 1)
            }
        }
    })

    // 组装
    items.forEach((doctor) => {
        let idx = keys.findIndex((k) => k === doctor.DoctorType)
        if (idx !== -1) {
            let fields = mapping.doctor[keys[idx]]
            shell[`${fields}_code`] = doctor.DoctorCode
            shell[`${fields}_name`] = doctor.DoctorName
        }
    })
    return shell
}

/**
 * 组装费用信息
 * @param { array } items 费用列表
 */
function assembleFee(items) {
    let shell = {},
        keys = Object.keys(mapping.fee)
    if (items.length === 0) return shell

    // 去重，多个同类型的费用时取最新(lastModifyTime)的一条为准
    keys.forEach((key) => {
        let res = items.filter((d) => d.FeeClassName === key)
        if (res.length > 1) {
            res.sort((x, y) => x.LastModifyTime - y.LastModifyTime)
            for (let i = 1; i < res.length; i++) {
                let idx = items.findIndex((d) => d.ID === res[i].ID)
                if (idx !== -1) items.splice(idx, 1)
            }
        }
    })

    // 组装
    items.forEach((fee) => {
        let idx = keys.findIndex((k) => k === fee.FeeClassName)
        if (idx !== -1) {
            let fields = mapping.fee[keys[idx]]
            shell[`${fields}_code`] = fee.FeeClassCode
            shell[`${fields}_name`] = fee.FeeClassName
            shell[`${fields}_value`] = fee.FeeValue
        }
    })
    return shell
}

/**
 * 组装 icu 信息
 * @param { array } items icu 列表
 */
function assembleICU(items) {
    if ((items.length = 0)) return []
    return items.map((icu) => ({
        code: icu.ICUCode,
        name: icu.ICUName,
        entry_time: icu.EntryTime,
        out_time: icu.OutTime,
    }))
}

/**
 * 组装转科信息
 * @param { array } items 转科列表
 */
function assembleTransfer(items) {
    if ((items.length = 0)) return []
    return items.map((t) => ({
        origin_code: t.OriginalDeptCode,
        origin_name: t.OriginalDeptName,
        target_code: t.NewDeptCode,
        target_name: t.NewDeptName,
        transfer_order: t.TransferOrder,
        transfer_date: t.TransferDate,
    }))
}

/**
 * 通过 ipb_id 获取 document
 * @param { string } id ipb_id
 */
async function getThisDocumentById(id) {
    try {
        let tsqlBase = `select * from fs_inPatientBase where codeState=1000 and (deleted is null or deleted = 0) and id='${id}'`,
            tsqlContact = `select * from fs_inpatientContact where (deleted is null or deleted = 0) and ipb_id='${id}'`,
            tsqlDiagnosis = `select * from fs_inpatientDiagnosis where (deleted is null or deleted = 0) and ipb_id='${id}'`,
            tsqlOperation = `select * from fs_inpatientOperation where (deleted is null or deleted = 0) and ipb_id='${id}'`,
            tsqlDoctor = `select * from fs_inpatientDoctor where (deleted is null or deleted = 0) and ipb_id='${id}'`,
            tsqlFee = `select * from fs_inpatientFee where (deleted is null or deleted = 0) and ipb_id='${id}'`,
            tsqlIcu = `select * from fs_inpatientIcu where (deleted is null or deleted = 0) and ipb_id='${id}'`,
            tsqlTransfer = `select * from fs_inpatientTransfer where (deleted is null or deleted = 0) and ipb_id='${id}'`

        // 如果链接失败了的话，就直接进 catch 了
        await sql.connect(config)
        // 准备好请求对象
        let request = new sql.Request()

        // 文档雏形
        let document = {
            id,
            diagnosis_count: 0, // 诊断数
            allergy_count: 0, // 过敏数
            clinic_count: 0, // 临床数
            operation_count: 0, // 操作数
            surgery_count: 0, // 手术数
            icu_count: 0, // icu 数
            transfer_count: 0, // 转科数
            contact_count: 0, // 联系人数
            contact: [],
            clinical: {
                in_diagnosis: [],
                out_diagnosis: [],
                emergency_diagnosis: [],
                allergy_diagnosis: [],
                infect_diagnosis: [],
                surgery: [],
                operation: [],
            },
            pumch: {
                in_diagnosis: [],
                out_diagnosis: [],
                out_injury_diagnosis: [],
                out_pathology_diagnosis: [],
                emergency_diagnosis: [],
                allergy_diagnosis: [],
                infect_diagnosis: [],
                surgery: [],
                operation: [],
            },
            beijing: {
                in_diagnosis: [],
                out_diagnosis: [],
                out_injury_diagnosis: [],
                out_pathology_diagnosis: [],
                emergency_diagnosis: [],
                allergy_diagnosis: [],
                infect_diagnosis: [],
                surgery: [],
                operation: [],
            },
            doctor: [],
            fee: {},
            icu: [],
            transfer: [],
        }
        // 查询 住院基础信息
        let baseRecordset = await request.query(tsqlBase)
        if (baseRecordset.recordset.length > 0)
            document = Object.assign(
                document,
                assembleBase(baseRecordset.recordset)
            )
        else throw new Error(`${id}, 没有查找到对应的住院信息`)

        // 查询 联系人信息
        let baseContact = await request.query(tsqlContact)
        if (baseContact.recordset.length > 0) {
            document.contact = assembleContact(baseContact.recordset)
            document.contact_count = document.contact.length
        }

        // 查询 诊断信息
        let baseDiagnosis = await request.query(tsqlDiagnosis),
            baseOperation = await request.query(tsqlOperation)
        if (
            baseDiagnosis.recordset.length > 0 ||
            baseOperation.recordset.length > 0
        ) {
            document.clinical = assembleClinical(
                baseDiagnosis.recordset,
                baseOperation.recordset,
                document.mrid,
                document.hospitalized_times
            )
            document.pumch = assemblePumch(
                baseDiagnosis.recordset,
                baseOperation.recordset,
                document.mrid,
                document.hospitalized_times
            )
            document.beijing = assembleBeijing(
                baseDiagnosis.recordset,
                baseOperation.recordset,
                document.mrid,
                document.hospitalized_times
            )

            // 这里还需要一个 国际 诊断
        }

        // 查询 医生信息
        let baseDoctor = await request.query(tsqlDoctor)
        if (baseDoctor.recordset.length > 0)
            document.doctor = assembleDoctor(baseDoctor.recordset)

        // 查询 费用信息
        let baseFee = await request.query(tsqlFee)
        if (baseFee.recordset.length > 0)
            document.fee = assembleFee(baseFee.recordset)

        // 查询 icu 信息
        let baseIcu = await request.query(tsqlIcu)
        if (baseIcu.recordset.length > 0) {
            document.icu = assembleICU(baseIcu.recordset)
            document.icu_count = document.icu.length
        }

        // 查询 转科信息
        let baseTransfer = await request.query(tsqlTransfer)
        if (baseTransfer.recordset.length > 0) {
            document.transfer = assembleTransfer(baseTransfer.recordset)
            document.transfer_count = document.transfer.length
        }

        return document
    } catch (error) {
        console.trace(error.message)
        return err
    }
}

/**
 * 批量插入文档
 * @param { array } items 文档的集合
 */
async function batchInsert(items) {
    try {
        let body = items.map((doc) => ({
            index: {
                _index: 'bei',
            },
            ...doc,
        }))
        const res = await client.bulk({ refresh: true, body })
        return res
    } catch (error) {
        throw error
    }
}

let running = false,
    frequency = 1000,
    start = '2018-01-01'
setInterval(async () => {
    if (running) return
    running = true
    // frequency = 600000

    let end = moment(new Date(start)).add(1, 'days').format('YYYY-MM-DD'),
        count = 0
    try {
        // 获取时间段内的 id
        // 每一个 id 对应一次住院
        let ids = await getThisRangeDataIds(start, end),
            documents = []
        // 遍历 id 组装每一次住院的对象
        for (id of ids) {
            let res = await getThisDocumentById(id)
            documents.push(res)
        }
        count = ids.length
        if (ids.length > 0) await batchInsert(documents)
    } catch (error) {
        console.log(error.message)
        fs.writeFileSync(`${start}-${end}.txt`, error.message)
    } finally {
        running = false
        console.log(`${start} - ${end}: [${count}]`)
        start = end
    }
}, frequency)
