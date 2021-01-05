module.exports = (app) => {
    const { router, controller } = app
    // query package list
    router.get('/', controller.home.index)

    // query
    router.get('/query', controller.query.index)
    router.post('/search', controller.query.search)
    router.get('/query/result/:id', controller.query.result)
    router.get('/query/excel/:id', controller.query.excel)

    // dictionary
    router.get('/dic', controller.dic.dictionary)
    router.get('/dic/condition', controller.dic.condition)

    // task
    router.get('/task', controller.task.list)
    router.put('/task/:id', controller.task.putTask)
    router.get('/task/remind', controller.task.remind)
}
