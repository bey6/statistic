const { program } = require('commander')
const moment = require('moment')
const figlet = require('figlet')
const chalk = require('chalk')
const td = require('./_trans_data.js')
const cfg = require('./config')

// 表示是否正在同步
let running = false,
    completedToday

// 近期数据更新脚本
async function dataUpdate(start, end, byModifyTime, now) {
    if (now) await td.DataUpdate(new Date(start), new Date(end), byModifyTime)
    else {
        // 今日是否完成
        completedToday = {
            date: moment(new Date()).format('YYYY-MM-DD'),
            state: false,
        }
        // 日期不相同则修改日期和状态
        if (completedToday.date !== moment(new Date()).format('YYYY-MM-DD')) {
            completedToday.date = moment(new Date()).format('YYYY-MM-DD')
            completedToday.state = false
        } else if (completedToday.state) return // 日期相同并且今日已完成，返回

        const weekdays = {
            '周日': 0,
            '周一': 1,
            '周二': 2,
            '周三': 3,
            '周四': 4,
            '周五': 5,
            '周六': 6,
        }
        // 上一次的同步还没跑完则返回
        if (running) return
        let today = new Date();
        // 不在指定的周天则返回
        if (today.getDay() !== weekdays[cfg.week]) return
        // 不在指定的小时则返回
        if (!cfg.hours.includes(today.getHours())) return

        running = true
        setInterval(async () => {
            try {
                await td.DataUpdate(new Date(start), new Date(end), byModifyTime)
                completedToday.state = true
            } catch (ex) {
                console.log(ex);
            } finally {
                running = false
            }
        }, cfg.cycle * 1000 * 60)
    }
}

// 全数据修复脚本
async function dataRepair() {
    try {
        await td.DataRepair(new Date('1900/1/1'), new Date())
    } catch (ex) {
        console.log(ex);
    } finally {
        process.exit()
    }
}

figlet('Sync Tool', (err, data) => {
    if (err) {
        console.dir(err);
        return;
    }
    console.log('\r\n' + chalk.white('> 脚本说明' + chalk.green('\t 技术支持: 刘备')))
    console.log('\r\n----------------------------------------------------------------------------------------------------')
    console.log(chalk.green('-u, --update') + chalk.white('\t定期同步，按 LastModifyTime 查找最近的数据进行更新同步, 1: 按照修改时间更新；0: 按出院时间更新'))
    console.log(chalk.green('-r, --repair') + chalk.white('\t数据修复，将命中的全部数据进行 delete & insert 动作，按照出院时间修复'))
    console.log(chalk.green('-n, --now') + chalk.white('\t立即执行，结束后关闭，配合 -u 使用'))
    console.log('----------------------------------------------------------------------------------------------------')
    console.log()
    program.version('0.0.1')
        .option('-u, --update <type>', '定期同步，按 LastModifyTime 查找最近的数据进行更新同步, 1: 按照修改时间更新；0: 按出院时间更新')
        .option('-r, --repair', '数据修复，将命中的全部数据进行 delete & insert 动作，按照出院时间修复')
        .option('-n, --now', '立即执行，结束后关闭')
        .parse(process.argv)

    void (
        function () {
            try {
                const payload = program.opts()
                if (payload.update) {
                    let start = moment().add(-cfg.nearWeeks, 'weeks'),
                        end = moment(new Date()).add(-1, 'days')
                    byModifyTime = false
                    if (program.update === 1 || program.update === '1') byModifyTime = true
                    dataUpdate(new Date(start), new Date(end), byModifyTime, payload.now)
                }
                else if (payload.repair) dataRepair()
            } catch (error) {
                console.log(error)
            }
        }
    )()
})
