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
            enumerable: false, // 可枚举
            type: 'string', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '包含',
                    code: 'in',
                },
            ],
            db: '',
            table: '',
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
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 4,
            code: 'DischargeDateTime',
            name: '出院日期',
            py: 'cyrq',
            enumerable: false, // 可枚举
            type: 'date', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },

        {
            key: 21,
            code: 'NationCode',
            name: '民族',
            py: 'mz',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '包含',
                    code: 'in',
                },
            ],
            db: '',
            table: 'BaseDic_Nation',
        },
        {
            key: 22,
            code: 'ProvinceCode',
            name: '籍贯（省）',
            py: 'jgs',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '包含',
                    code: 'in',
                },
            ],
            db: '',
            table: 'BaseDic_Province',
        },
        {
            key: 23,
            code: 'Newborn_AdmissionWeight',
            name: '新生儿入院体重',
            py: 'xserytz',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 24,
            code: 'NewBorn_Day',
            name: '新生儿年龄(天)',
            py: 'xsenlt',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 25,
            code: 'NewBorn_Month',
            name: '新生儿年龄(月)',
            py: 'xsenly',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 26,
            code: 'NewBorn_Weight',
            name: '新生儿出生体重',
            py: 'xsecstz',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: 'Dic_Occupation',
        },
        {
            key: 27,
            code: 'OccupationCode',
            name: '职业',
            py: 'zy',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: 'Dic_Occupation',
        },
        {
            key: 28,
            code: 'QualityDate1',
            name: '质控日期1',
            py: 'zkrq1',
            enumerable: false, // 可枚举
            type: 'date', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 29,
            code: 'QualityDate2',
            name: '质控日期2',
            py: 'zkrq2',
            enumerable: false, // 可枚举
            type: 'date', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 30,
            code: 'ReadmissionIn31',
            name: '出院31天再入院计划',
            py: 'cy31tzryjh',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 31,
            code: 'RescueSuccessTime',
            name: '成功次数',
            py: 'cgcs',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 32,
            code: 'RescueTime',
            name: '抢救次数',
            py: 'qjcs',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 33,
            code: 'RespiratorTime',
            name: '呼吸机使用时间',
            py: 'hxjsysj',
            enumerable: false, // 可枚举
            type: 'number', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '大于',
                    code: 'gt',
                },
                {
                    name: '大于等于',
                    code: 'gte',
                },
                {
                    name: '小于',
                    code: 'lt',
                },
                {
                    name: '小于等于',
                    code: 'lte',
                },
                {
                    name: '介于',
                    code: 'between',
                },
            ],
            db: '',
            table: '',
        },
        {
            key: 34,
            code: 'RhCode',
            name: 'RH血型',
            py: 'rhxx',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
            operation: [
                {
                    name: '等于',
                    code: 'eq',
                },
                {
                    name: '包含',
                    code: 'in',
                },
            ],
            db: '',
            table: '',
        },
    ],
    /**
     * 住院
     */
    inpatient: [
        {
            code: 'BaseDiagnosis.InternalICDCode',
            name: '协和主诊断',
            py: 'xhzzd',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
        {
            code: 'Diagnosis.InternalICDCode',
            name: '协和诊断',
            py: 'xhzd',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
        {
            code: 'Diagnosis.DiagnosisICDCode',
            name: '北京诊断',
            py: 'bjzd',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
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
    doctor: [
        {
            code: 'Doctor.住院医师.姓名',
            name: '住院医师',
            py: 'zyys',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
    ],
    /**
     * 转科
     */
    transfer: [
        {
            code: 'VTransfer.NewDepCode',
            name: '转入科室编码',
            py: 'zrksbm',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
    ],
    /**
     * 联系地址
     */
    contact: [
        {
            code: 'Adress',
            name: '联系人住址',
            py: 'lxrzz',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
    ],
    /**
     * 其他
     */
    other: [
        {
            code: 'M',
            name: '肿瘤分期(M)',
            py: 'zlfqm',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
        {
            code: 'N',
            name: '肿瘤分期(N)',
            py: 'zlfqn',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
        {
            code: 'T',
            name: '肿瘤分期(T)',
            py: 'zlfqt',
            enumerable: true, // 可枚举
            type: 'string', // 字段类型: string|number|date
        },
    ],
}
