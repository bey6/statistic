module.exports = {
    /**
     * 映射
     */
    mapping: [
        {
            code: 'basic',
            name: '基本',
        },
        {
            code: 'inpatient',
            name: '住院',
        },
        {
            code: 'outpatient',
            name: '门急诊',
        },
        {
            code: 'allergy',
            name: '过敏',
        },
        {
            code: 'surgical_operation',
            name: '手术',
        },
        {
            code: 'operation',
            name: '操作',
        },
        {
            code: 'fee',
            name: '费用',
        },
        {
            code: 'doctor',
            name: '医师',
        },
        {
            code: 'transfer',
            name: '转科',
        },
        {
            code: 'contact',
            name: '联系地址',
        },
        {
            code: 'other',
            name: '其他',
        },
    ],
    /**
     * 基本
     */
    basic: [
        {
            key: 0,
            code: 'MRID',
            name: '病案号',
            py: 'bah',
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
            ],
        },
        {
            key: 1,
            code: 'PatientName',
            name: '姓名',
            py: 'xm',
        },
        {
            key: 2,
            code: 'Gender',
            name: '性别',
            py: 'xb',
        },
        {
            key: 3,
            code: 'Age',
            name: '年龄',
            py: 'nl',
        },
        {
            key: 4,
            code: 'DischargeDateTime',
            name: '出院日期',
            py: 'cyrq',
        },
    ],
    /**
     * 住院
     */
    inpatient: [
        {
            code: 'Diagnosis.InternalICDCode',
            name: '协和诊断',
            py: 'xhzd',
        },
        {
            code: 'Diagnosis.DiagnosisICDCode',
            name: '北京诊断',
            py: 'bjzd',
        },
    ],
    /**
     * 门急诊
     */
    outpatient: [],
    /**
     * 过敏
     */
    allergy: [],
    /**
     * 手术
     */
    surgical_operation: [
        {
            code: 'VSurgery.InternalICDCode',
            name: '协和手术',
            py: 'xhss',
        },
        {
            code: 'VSurgery.OperateICDCode',
            name: '北京手术',
            py: 'bjss',
        },
        {
            code: 'VSurgery.OperateLevel',
            name: '手术级别',
            py: 'ssjb',
        },
    ],
    /**
     * 操作
     */
    operation: [],
    /**
     * 费用
     */
    fee: [],
    /**
     * 医师
     */
    doctor: [],
    /**
     * 转科
     */
    transfer: [],
    /**
     * 联系地址
     */
    contact: [],
    /**
     * 其他
     */
    other: [],
}