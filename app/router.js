module.exports = (app) => {
    const { router, controller } = app
    router.get('/', controller.home.index)
    router.get('/query', controller.query.index)
    router.post('/search', controller.query.search)

    router.get('/fulltext', controller.fullText.index)


    // dictionary
    router.get('/dic', controller.dic.dictionary)
    router.get('/dic/condition', controller.dic.condition)

    // notification
    router.get('/notification', controller.notification.list)
}
