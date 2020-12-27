$(function () {

    $('#query').click(event => {
        window.location.href = '/query/result?id=1'
    })
    $('#condition-list').click(event => {
        if (event.target.tagName === 'I') {
            if ($(event.target).hasClass('btn-del')) {
                $(event.target.parentNode).remove()
            }
        }
    })
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
    $('#condition-tag-list').click(event => {
        if (event.target.tagName === 'LI') {
            let element = `
            <li draggable="true">
            <i class="bi bi-x btn-del rounded" style="color: brown"></i>
            <select
              class="form-control form-control-sm condition-list__item"
              style="flex: 0 0 64px"
            >
              <option>并且</option>
              <option>或者</option>
            </select>
            <span class="condition-list__name rounded">${event.target.textContent}</span>
            <select
              class="condition-list__item form-control form-control-sm"
              style="flex: 0 0 128px"
            >
              <option>=</option>
              <option>≥</option>
              <option>≤</option>
            </select>
            <input
              class="condition-list__item form-control form-control-sm"
              type="text"
              style="margin: 0"
            />
            <i class="bi bi-arrows-move btn-drag"></i>
          </li>
            `
            $('#condition-list').append(element)
        }
    })
})