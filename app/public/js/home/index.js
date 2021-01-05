/* eslint-disable no-undef */
$(function () {
    $('#notificationCount').css('display', 'none')
    setInterval(() => {
        $.get('/task/remind', res => {
            let notes = []
            res.data.forEach(n => {
                notes.push(`<a class="dropdown-item" href="/query/result/${n.SearchId}"><span class="badge badge-success">Ok</span> ${n.Name}</a>`)
            })
            $('#notificationList').html(notes.join(''))
            $('#notificationCount').text(res.data.length)
            if (res.data.length > 0) $('#notificationCount').css('display', 'block')
        })
    }, 30000)
})