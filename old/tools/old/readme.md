# 首页统计系统同步工具

关键脚本文件：

- config.js
  - 配置文件
- sync.js
  - 同步工具命令行工具

## config.js

```js
module.exports = {
  dbServer: '172.30.199.163\\dev', // 首页库
  host: '172.30.199.166:9200', // es 库
  index: 'mrfs', // es 索引名称
  saveSubItemCount: true, // 是否保存扩展的复合文档信息
  replaceSingleQuotes: ' ', // 数据里面的单引号的替换符号

  // 2020年12月9日 刘备
  cycle: 59, // 脚本检查周期(单位：分钟)
  week: '周日', // 脚本在周几跑
  hours: [21, 22, 23], // 几点跑(24小时制)
  nearWeeks: 1, // 同步范围，最近几个(周, 不包括今天)
}
```

关键参数说明：

- dbServer: 首页库
- host: es 库
- index: es 的对应索引名称
- cycle: 定时类同步工具的检查周期，单位是分钟
- week: 定时类同步工具在命中周几的时候进行同步
- hours: 定时类同步工具在满足星期命中之后，同时满足给定小时的命中时，就会执行同步
- nearWeeks: 近几周，单位是周

## sync.js

在项目的根目录执行 `node sync.js` 查看脚本说明。

```bash
$ node sync.js
  ____                     _____           _
 / ___| _   _ _ __   ___  |_   _|__   ___ | |
 \___ \| | | | '_ \ / __|   | |/ _ \ / _ \| |
  ___) | |_| | | | | (__    | | (_) | (_) | |
 |____/ \__, |_| |_|\___|   |_|\___/ \___/|_|
        |___/

> 脚本说明       技术支持: 刘备

--------------------
- pm2 start runUpdateByDischargeTime.js --name data-sync-dt --node-args="--max-old-space-size=6000"      - 按出院时间执行定期同步
- pm2 start runUpdateByModifyTime.js --name data-sync-mt --node-args="--max-old-space-size=6000"         - 按最后更改日期执行定期同步
- node --max-old-space-size=6000 runRepair.js   - 执行全数据修复，完成后自动退出
--------------------
```

`注意`:

因为全数据修复不需要支持异常重启机制，所以使用 `screen` 执行即可。

**启动同步工具**

1. 修改 `config.js` 文件中的 `cycle` 值为 `1`，`nearWeeks` 值为 `9`，`hours` 值添加当前时间
2. screen -S datasync 启动一个 screen，在其中执行 `node --max-old-space-size=6000 runUpdateByDischargeTime.js`
3. ctrl + a, ctrl + d 退出 screen
