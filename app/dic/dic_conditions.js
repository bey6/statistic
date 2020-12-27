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
        }
    ],
    /**
     * 基本
     */
    basic: [
        {
            key: 0,
            code: 'mrid',
            name: '病案号',
            py: 'bah'
        },
        {
            key: 1,
            code: 'patient_name',
            name: '姓名',
            py: 'xm'
        },
        {
            key: 2,
            code: 'gender',
            name: '性别',
            py: 'xb'
        },
        {
            key: 3,
            code: 'age',
            name: '年龄',
            py: 'nl'
        },
        {
            key: 4,
            code: 'out_datetime',
            name: '出院日期',
            py: 'cyrq'
        }
    ],
    /**
     * 住院
     */
    inpatient: [
        {
            code: 'internal_diagnosis_code',
            name: '协和诊断',
            py: 'xhzd'
        },
        {
            code: 'external_diagnosis_code',
            name: '北京诊断',
            py: 'bjzd'
        }
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
            code: 'internal_operation_code',
            name: '协和手术',
            py: 'xhss'
        },
        {
            code: 'external_operation_code',
            name: '北京手术',
            py: 'bjss'
        }
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
    other: []
}