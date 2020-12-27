$(function () {
    const storageRanking = 'docimax@statistic:common'
    getCommonTags()

    // 点击查询按钮
    $('#query').click(event => {
        event.preventDefault()
        let mapping = ['relation', 'operation', 'value'],
            params = $('form').serializeArray(),
            formData = []

        mapping.forEach((m, idx) => {
            let arr = params.filter(p => p.name === m)
            arr.forEach((rlt, idxItem) => {
                if (idx === 0) {
                    formData.push({
                        m: rlt.value
                    })
                } else {
                    formData[idxItem][m] = rlt.value
                }
            })
        })
        console.log(formData)
        $('form').submit()
    })

    // 条件列表的代理事件
    // 内含--删除事件
    $('#condition-list').click(event => {
        if (event.target.tagName === 'I') {
            if ($(event.target).hasClass('btn-del')) {
                $(event.target.parentNode).remove()
            }
        }
    })

    // 欲实现拖拽移位功能, 目前尚未实现
    $('#condition-list').mousedown(event => {
        if ($(event.target).hasClass('btn-drag')) {
            const drop_li = `
                <li class="dropable"></li>
            `
            $('#condition-list').children().filter(e => {
                console.log(e)
                console.log($(e))
            })
            $.each($('#condition-list').children().filter(e => $(e).attr('draggable') === true), function (idx, item) {
                // $(drop_li).insertBefore(item)
                $(drop_li).insertAfter(item)

            })
        }
        // else event.preventDefault()
    })
    // 条件标签点击事件
    // 点击后请求接口, 获取相应的条件集合
    $('#condition-tag').click(event => {
        let target = event.target
        if (target.nodeName === 'LI') {
            $('#condition-tag').children().removeClass('condition-tag--active')
            $(target).addClass('condition-tag--active')
            let selectedTag = $(target).data('code')
            if (selectedTag === 'common') getCommonTags()
            else {
                $.get(`/dic/condition?t=${selectedTag}`, res => {
                    generateTagList(res.data)
                })
            }
        }
    })
    // 生成条件 tag 列表
    function generateTagList(tags) {
        $('#condition-tag-list').empty()
        tags.forEach(tag => {
            $('#condition-tag-list').append(`<li data-code="${tag.code}"><i class="bi bi-arrow-left-square-fill"></i> ${tag.name}</li>`)
        })
    }
    // 条件标签点击事件代理
    // 点击后将会在条件列表添加一条对应的项
    // 同时也会记录标签的点击次数
    $('#condition-tag-list').click(event => {
        if (event.target.tagName === 'LI' || event.target.tagName === 'I') {
            let name = '',
                code = ''
            if (event.target.tagName === 'I') {
                name = event.target.parentNode.textContent
                code = $(event.target.parentNode).data('code')
            } else {
                name = event.target.textContent
                code = $(event.target).data('code')
            }

            let element = `
            <li draggable="true">
            <i class="bi bi-x btn-del rounded" style="color: brown"></i>
            <select
              name="relation"
              class="form-control form-control-sm condition-list__item"
              style="flex: 0 0 64px"
            >
              <option value="and">并且</option>
              <option value="or">或者</option>
            </select>
            <span class="condition-list__name rounded">${name}</span>
            <select
              name="operation"
              class="condition-list__item form-control form-control-sm"
              style="flex: 0 0 128px"
            >
              <option>=</option>
              <option>≥</option>
              <option>≤</option>
            </select>
            <input
              name="value"
              class="condition-list__item form-control form-control-sm"
              type="text"
              style="margin: 0"
            />
            <i class="bi bi-arrows-move btn-drag"></i>
          </li>`
            $('#condition-list').append(element)
            increaseTagScore({ code: code, name: name })
        }
    })
    // 增加标签得分
    function increaseTagScore({ code, name }) {
        let ranking = localStorage.getItem(storageRanking) || "[]",
            rankingObj = JSON.parse(ranking),
            idx = rankingObj.findIndex(r => r.code === code)
        if (idx !== -1) rankingObj[idx].score++
        else rankingObj.push({
            code: code,
            name: name,
            score: 1
        })

        rankingObj.sort((x, y) => x.score - y.score)
        if (rankingObj.length < rankingObj[rankingObj.length - 1].score) {
            for (let i = 0; i < rankingObj.length; i++) {
                rankingObj[i].score = i + 1
            }
        }
        rankingObj.sort((x, y) => y.score - x.score)

        let rankingStr = JSON.stringify(rankingObj)
        localStorage.setItem(storageRanking, rankingStr)
    }
    // 提取常用项
    function getCommonTags() {
        let ranking = localStorage.getItem(storageRanking) || "[]",
            rankingObj = JSON.parse(ranking)
        rankingObj.sort((x, y) => y.score - x.score)
        generateTagList(rankingObj)
    }
})