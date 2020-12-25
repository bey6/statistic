$(function () {

    $('#query').click('click', event => {
        window.location.href = '/query/result?id=1'
    })

    $('#condition-list').click('click', event => {
        if (event.target.tagName === 'I') $(event.target.parentNode).remove()
    })

    $('#condition-tag-list').click('click', event => {
        if (event.target.tagName === 'LI') {
            let element = `
            <li>
            <i class="bi bi-x btn-icon rounded" style="color: brown"></i>
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
          </li>
            `
            $('#condition-list').append(element)
        }
    })
})