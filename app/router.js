module.exports = app => {
    const { router, controller } = app
    router.get('/', controller.home.index)
    router.get('/news', controller.news.list)
    router.get('/query', controller.query.index)
    router.post('/search', controller.query.search)

    router.get('/fulltext', controller.fullText.index)



    router.get('/dic/condition', controller.dic.condition)
}