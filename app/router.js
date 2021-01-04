module.exports = (app) => {
    const { router, controller } = app
    // query package list
    router.get('/', controller.home.index)

    // query
    router.get('/query', controller.query.index)
    router.post('/search', controller.query.search)
    router.get('/query/result', controller.query.result)

    // dictionary
    router.get('/dic', controller.dic.dictionary)
    router.get('/dic/condition', controller.dic.condition)

    // notification
    router.get('/notification', controller.notification.list)
}
