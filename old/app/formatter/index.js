module.exports = {
    timeFmt: (t) => {
        if (t) return t.slice(0, 19).replace('T', ' ')
        else return ''
    }
}