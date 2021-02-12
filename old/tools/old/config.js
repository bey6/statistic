module.exports = {
    dbServer: '172.30.199.163', // 首页库
    host: '172.30.199.41:9200', // es 库
    index: 'mrfs', // es 索引名称
    saveSubItemCount: true, // 是否保存扩展的复合文档信息
    replaceSingleQuotes: ' ', // 数据里面的单引号的替换符号

    // 2020年12月9日 刘备
    cycle: 1, // 脚本检查周期(单位：分钟)
    week: '周一', // 脚本在周几跑
    hours: [12, 13, 14, 15, 16, 17], // 几点跑(24小时制)
    nearWeeks: 99, // 同步范围，最近几个(周, 不包括今天)
}