# 首页系统：检索

## 开发环境

前端库使用 jquery + bootstrap 为主的方式进行开发。
业务层使用 egg.js framwork + nunjucks view engine 的组合进行接口与页面的开发渲染。
数据层使用 sqlserver + elasticsearch 两种 db，其中，elasticsearch 提供检索统计能力，sqlserver 提供非检索统计能力。

## 解决的问题

-   引入 xm-select.js 插件解决可枚举字典的远程搜索、多选功能。
-   引入 tempusdominus-bootstrap-4.js + moment.js 的组合解决日期组件不友好的问题。

## 现存的问题

-   检索时，当约束过少时，存在页面失去响应的问题，考虑使用异步的方式进行检索，而不是让用户同步等待检索结果。
    -   考虑生成一个 search_id，在用户进行检索时把 search_id 发送给用户，后台在完成检索后，把结果存库，用户可以通过 search_id 查看检索的状态。
    -   考虑将检索之后的结果保存到本地，将 search_id 作为文件名，将检索结果完整放入其中。
    -   检索结果应该提供定期清理的机制，不能无限制的永久保存。
    -   \[可选\] 需要一个任务队列，因为当检索时如果生成一个 search_id 就返回的话，有可能导致检索根本就没有开始启动，另一方面如果每个人接到请求之后都立刻进行检索估计引擎本身可能也受不了。
    -   Need a worker process do that only get the task from seqence and run it.
    -   页面右上角添加一个消息角标，用来定期检索是否有完成的任务
