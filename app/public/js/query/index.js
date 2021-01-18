/* eslint-disable no-undef */
$(function () {
    const storageRanking = 'docimax@statistic:common'

    let cookies = document.cookie.split('; ').map(c => ({ key: c.split('=')[0], value: c.split('=')[1] })),
        token = cookies.find(c => c.key === 'csrfToken')

    // // 点击查询按钮
    // $('#query').click((event) => {
    //     event.preventDefault()

    //     let arr = $('form').serializeArray(),
    //         action = $('form').attr('action')

    //     $.ajax({
    //         type: 'POST',
    //         url: action,
    //         data: arr,
    //         success: (res) => {
    //             $('#searchId').text(res.data.search_id)
    //             $('#staticBackdrop').modal('show')
    //         },
    //     })
    //     return false
    // })
    $('#btnAlias').click(() => {

        let search_id = $('#searchId').text(),
            alias = $('#taskAlias').val()

        if (!alias || !search_id) return

        $.ajax({
            type: 'PUT',
            url: '/task/' + search_id,
            data: {
                name: alias
            },
            headers: {
                'x-csrf-token': token.value
            }
        }).done(res => {
            console.log(res)
        })
    })

    getCommonTags()

    // 条件列表的代理事件
    // 内含--删除事件
    $('#condition-list').click((event) => {
        if (event.target.tagName === 'I') {
            if ($(event.target).hasClass('btn-del')) {
                $(event.target.parentNode).remove()
            }
        }
    })
    // 欲实现拖拽移位功能, 目前尚未实现
    // [未完成的]
    $('#condition-list').mousedown((event) => {
        if ($(event.target).hasClass('btn-drag')) {
            const drop_li = `
                <li class="dropable"></li>
            `
            $('#condition-list')
                .children()
                .filter((e) => {
                    console.log(e)
                    console.log($(e))
                })
            $.each(
                $('#condition-list')
                    .children()
                    .filter((e) => $(e).attr('draggable') === true),
                function (idx, item) {
                    // $(drop_li).insertBefore(item)
                    $(drop_li).insertAfter(item)
                }
            )
        }
        // else event.preventDefault()
    })
    // 条件标签点击事件
    // 点击后请求接口, 获取相应的条件集合
    $('#condition-tag').click((event) => {
        let target = event.target
        if (target.nodeName === 'LI') {
            $('#condition-tag').children().removeClass('condition-tag--active')
            $(target).addClass('condition-tag--active')
            let selectedTag = $(target).data('code')
            if (selectedTag === 'common') getCommonTags()
            else {
                $.get(`/dic/condition?t=${selectedTag}`, (res) => {
                    generateTagList(res.data)
                })
            }
        }
    })
    // 生成条件 tag 列表
    function generateTagList(tags) {
        $('#condition-tag-list').empty()
        tags.forEach((tag) => {
            $('#condition-tag-list').append(
                `<li data-code="${tag.code}"><i class="bi bi-arrow-left-square-fill" style="margin-right:4px"></i>${tag.name}</li>`
            )
        })
    }
    // 条件标签点击事件代理
    // 点击后将会在条件列表添加一条对应的项
    // 同时也会记录标签的点击次数
    $('#condition-tag-list').click((event) => {
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

            // draggable="true"
            let element = $(`
            <li>
                <i class="bi bi-arrows-move btn-drag"></i>
                <select
                    name="relation"
                    class="form-control form-control-sm condition-list__item"
                    style="flex: 0 0 64px"
                >
                    <option value="and">并且</option>
                    <option value="or">或者</option>
                </select>
                <input
                    name="name"
                    class="form-control form-control-sm condition-list__name"
                    readonly="true"
                    type="text"
                    value="${name}"
                />
                <input name="code" type="hidden" value="${code}">
                <select
                    name="operation"
                    class="condition-list__item form-control form-control-sm"
                    style="flex: 0 0 128px"
                >
                    <option value="eq">等于</option>
                    <option value="gt">大于</option>
                    <option value="gte">大于等于</option>
                    <option value="lt">小于</option>
                    <option value="lte">小于等于</option>
                    <option value="in">包括</option>
                    <option value="diff">异次病发</option>
                </select>
                <div class="values condition-list__item" style="margin: 0"></div>
                <i class="bi bi-x btn-del rounded" style="color: brown"></i>
            </li>`)
            let values = element.find('.values')[0]
            // 可枚举 + string (单项, 多选, 要有区别)
            if (name === '协和诊断')
                xmSelect.render({
                    el: values,
                    name: 'vls',
                    size: 'mini',
                    template({ item, value }) {
                        return (
                            item.name +
                            '<span style="position: absolute; right: 10px; color: #8799a3">' +
                            value +
                            '</span>'
                        )
                    },
                    prop: {
                        name: 'name',
                        value: 'code',
                    },
                    style: {
                        height: '31px',
                        'min-width': '221px',
                    },
                    toolbar: {
                        show: true,
                        showIcon: false,
                    },
                    model: { label: { type: 'text' } },
                    data: () => [
                        { name: '霍乱', value: 1 },
                        { name: '霍乱ex', value: 2 },
                    ],
                    paging: true,
                    pageSize: 20,
                    filterable: true,
                    remoteSearch: true,
                    remoteMethod: function (val, cb /* show */) {
                        $.get(`/dic?t=1&k=${val}`, (res) => {
                            console.log(res)
                            if (res.code === 200) cb(res.data)
                            else cb([])
                        })
                    },
                })
            else if (name === '出院日期') {
                // date
                let idx = $('#condition-list').children().length
                let dateEle = $(`
                <div class="input-group date condition-list__item" id="datetimepicker${idx}" data-target-input="nearest" style="margin:0;min-width: 221px">
                    <input name="vls" type="text" class="form-control form-control-sm datetimepicker-input" data-target="#datetimepicker${idx}"/>
                    <div class="input-group-append" data-target="#datetimepicker${idx}" data-toggle="datetimepicker" style="height:31px">
                        <div class="input-group-text"><i class="bi bi-calendar-date"></i></div>
                    </div>
                </div>`)[0]
                $($(dateEle)[0]).datetimepicker({ format: 'YYYY-MM-DD' })
                values.replaceWith(dateEle)
                // values.replaceWith($('<input name="vls" type="date" class="condition-list__item form-control form-control-sm datetimepicker-input" value="2018-07-22" min="2018-01-01" max="2018-12-31" style="margin: 0">')[0])
            } else if (name === '年龄')
                // number
                values.replaceWith(
                    $(
                        '<input name="vls" type="number" class="condition-list__item form-control form-control-sm" style="margin: 0" min="0"/>'
                    )[0]
                )
            // 不可枚举 + string
            else
                values.replaceWith(
                    $(
                        '<input name="vls" class="condition-list__item form-control form-control-sm" type="text" style="margin: 0"/>'
                    )[0]
                )

            $('#condition-list').append($(element))
            increaseTagScore({ code: code, name: name })
        }
    })
    // 增加标签得分
    function increaseTagScore({ code, name }) {
        let ranking = localStorage.getItem(storageRanking) || '[]',
            rankingObj = JSON.parse(ranking),
            idx = rankingObj.findIndex((r) => r.code === code)
        if (idx !== -1) rankingObj[idx].score++
        else
            rankingObj.push({
                code: code,
                name: name,
                score: 1,
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
        let ranking = localStorage.getItem(storageRanking) || '[]',
            rankingObj = JSON.parse(ranking)
        rankingObj.sort((x, y) => y.score - x.score)
        generateTagList(rankingObj)
    }


    // 页面离开时，清理状态
    window.onunload = () => {
        $('#staticBackdrop').modal('hide')
    }
})
