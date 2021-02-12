# 首页系统：检索

## 系统架构

![系统架构](./doc/statistic.png)

## 开发环境

前端库使用 jquery + bootstrap 为主的方式进行开发。
业务层使用 egg.js framwork + nunjucks view engine 的组合进行接口与页面的开发渲染。
数据层使用 sqlserver + elasticsearch 两种 db，其中，elasticsearch 提供检索统计能力，sqlserver 提供非检索统计能力。
此外还用到了 redis 库，但并没有直连它，而是通过应用层服务代理完成缓存需求。

## 解决的问题

- 采用集群部署方式，极大的提高了检索性能
- 从前后端分离的方式改为服务端渲染，同时将大量的数据进行了拆解，避免了检索大批量数据时出现的客户端假死问题
- 条件栏作为工具栏停靠在右侧，选择条件更加方便快捷，有效的避免了选择两个同样的过滤项时需要打开两次面板的问题
- 引入 xm-select.js 插件解决可枚举字典的远程搜索、多选功能。
- 引入 tempusdominus-bootstrap-4.js + moment.js 的组合解决日期组件不友好的问题，支持输入诸如 2020、202010 此类

## 现存的问题

- 检索时，当约束过少时，存在页面失去响应的问题，考虑使用异步的方式进行检索，而不是让用户同步等待检索结果。
  - 考虑生成一个 search_id，在用户进行检索时把 search_id 发送给用户，后台在完成检索后，把结果存库，用户可以通过 search_id 查看检索的状态。
  - 考虑将检索之后的结果保存到本地，将 search_id 作为文件名，将检索结果完整放入其中。
  - 检索结果应该提供定期清理的机制，不能无限制的永久保存。
  - \[可选\] 需要一个任务队列，因为当检索时如果生成一个 search_id 就返回的话，有可能导致检索根本就没有开始启动，另一方面如果每个人接到请求之后都立刻进行检索估计引擎本身可能也受不了。
  - Need a worker process do that only get the task from seqence and run it.
  - 页面右上角添加一个消息角标，用来定期检索是否有完成的任务
- 由于一些现实原因，检索必须是同步的方式完成
  - 在进行大数据量的检索时，由于数据量级过大会导致 es 与 node 应用站点出现 memory 层面的问题，为了解决该问题，es 层面给出了 [search-after](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html#search-after) 方案，目前正在尝试中···
  - search-after 不需要传递 from 字段，但是需要传递 search_after 字段，理论上该字段给的是上一页 hits 中最后一项的 sort 字段。
- 异次病发的个数需要控制，默认只允许 4 级异次，要可配

## 检索

### 关于异次病发的功能设计

> 0. 【可选】取住院次大于 1 的 mrid
> 1. 【以步骤 0 作为 filter】获取满足第一组诊断的病案号，及其 ipbid
> 2. 把第一步的 mrid 作为 filter，ipbid 作为 must_not filter，获取满足第二组诊断的病案号，及其 ipbid
> 3. 把第二步的 mrid 作为 filter，ipbid 作为 must_not filter，获取满足第三组诊断的病案号，及其 ipbid
> 4. ...
> 5. 取最后一次命中的 mrid、ipbid，以 mrid 为条件，从循环中的每一步得到的 mrid, ipbid 对中取 mrid 属于最终结果集中的 mrid 的 ipbid 拼接为一个 ipbid 数组
> 6. 【可选】如果希望支持单次住院满足，则每次的 must_not 可以跳过

## 统计

### 术语

| 名词 | 简介                     | 类比                               |
| ---- | ------------------------ | ---------------------------------- |
| 桶   | 满足特定条件的文档的集合 | 相当于 group by 之后的每一个分组项 |
| 指标 | 对桶内的文档进行统计计算 | 相当于 sum 函数什么的              |
| 聚合 | 桶和指标组合起来         | group by + sum                     |

### 试一下

访问 [Kibana](http://172.30.199.41:5601)，在 _Dev Tools_ 中贴入如下代码来进行 **MRID** 数量的聚合：

```json
GET mrfs/_search
{
  "size": 0,
  "aggs": {
    "count": {
      "terms": {
        "field": "MRID.keyword"
      }
    }
  }
}
```

聚合结果片段展示：

```json
"aggregations" : {
    "count" : {
      "doc_count_error_upper_bound" : 42,
      "sum_other_doc_count" : 248369,
      "buckets" : [
        {
          "key" : "1807104",
          "doc_count" : 88
        },
        {
          "key" : "C775202",
          "doc_count" : 71
        },
        {
          "key" : "1695003",
          "doc_count" : 54
        },
        {
          "key" : "1774009",
          "doc_count" : 42
        },
        {
          "key" : "W149114",
          "doc_count" : 41
        },
        {
          "key" : "W127801",
          "doc_count" : 37
        },
        {
          "key" : "1894605",
          "doc_count" : 35
        },
        {
          "key" : "C829096",
          "doc_count" : 35
        },
        {
          "key" : "C291205",
          "doc_count" : 34
        },
        {
          "key" : "C837862",
          "doc_count" : 34
        }
      ]
    }
  }
```

### 指标

| 指标           | 含义       | 用法                                                                                                                                                            |
| -------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| terms          | 个数       | "aggs": { "住院次数": { "terms": { "field": "MRID.keyword" } } }                                                                                                |
| avg            | 平均值     | "aggs": { "平均费用": { "avg": { "field": "Totalcost" } } }                                                                                                     |
| sum            | 求和       | "aggs": { "总费用": { "sum": { "field": "Totalcost" } } }                                                                                                       |
| min            | 最小值     | "aggs": { "最小费用": { "min": { "field": "Totalcost" } } }                                                                                                     |
| max            | 最大值     | "aggs": { "最大费用": { "max": { "field": "Totalcost" } } }                                                                                                     |
| extended_stats | 图表数据   | "aggs": { "包含了上面的各种": { "max": { "field": "Totalcost" } } }                                                                                             |
| date_histogram | 切割时间段 | "aggs": { "按季度统计···": { "date_histogram": { "field": "DischargeDateTime", "calendar_interval": "quarter", "format": "yyyy-MM-dd", "min_doc_count": 0 } } } |

### 基于检索的聚合

query 子句和 aggs 子句一起使用时，aggs 会在 query 子句的结果集中进行聚合，在无 query 子句时，在全结果集中进行聚合。

### 过滤

过滤有三种，检索过滤<sup>[[1]](#检索过滤)</sup>、检索后过滤<sup>[[2]](#检索后过滤)</sup>、桶过滤<sup>[[3]](#桶过滤)</sup>

#### 检索过滤

于 query 子句组合使用，会影响聚合结果：

```json
"query": {
    "constant_score": {
      "filter": {
        "range": {
          "DischargeDateTime": {
            "gte": "2018-01-01"
          }
        }
      }
    }
  }
```

#### 检索后过滤

单独的子句，影响检索结果，但不会影响聚合结果（聚合在其之前完成）：

```json
"post_filter": {
    "term": {
      "MRID.keyword": "2333509"
    }
  },
```

#### 桶过滤

只影响聚合结果（桶），不影响检索结果，比如只看 2018 年个季度的桶内的总收入：

```json
"aggs": {
    "2018": {
      "filter": {
        "range": {
          "DischargeDateTime": {
            "gte": "2018-01-01",
            "lte": "2018-12-31"
          }
        }
      },
      "aggs": {
        "yue":{
          "date_histogram": {
            "field": "DischargeDateTime",
            "calendar_interval": "quarter",
            "format": "yyyy-MM-dd",
            "min_doc_count": 0,
            "order": {
              "shouru": "desc"
            }
          },
          "aggs": {
            "shouru": {
              "sum": {
                "field": "Totalcost"
              }
            }
          }
        }
      }
    }
  }
```

### 排序

每个指标中都可以添加 order 进行排序，例如按照季度统计住院费用，并且按季度费用倒叙排列桶：

```json
"aggs": {
    "yue": {
      "date_histogram": {
        "field": "DischargeDateTime",
        "calendar_interval": "quarter",
        "format": "yyyy-MM-dd",
        "min_doc_count": 0,
        "order": {
          "shouru": "desc"
        }
      },
      "aggs": {
        "shouru": {
          "sum": {
            "field": "Totalcost"
          }
        }
      }
    }
  }
```

支持深度排序，需要在指标名称中间用 '`>`' 链接，例如: `shouru>every_person_total`。

### 统计模块功能设计

基于已经掌握的知识，在统计模块应该支持的基础功能至少包括：

- 求最大值
- 求最小值
- 求平均值
- 求合计
- 求个数

原系统支持统计类型包括：

- 结果计数
- 去重计数
- 前缀计数
- 后缀计数
- 分组计数
- 区间计数
- 联合分组计数
- 联合分组最大
- 联合分组最小
- 联合分组区间
- 联合分组前缀
- 联合分组后缀

**联合分组**

联合分组的含义是指按照搜索的几个联合分组项依次分组，也就是把所有类型相同的联合组合起来一同统计。联合与不联合的结果差异大概如下：

普通分组的含义就是单独统计，仅仅是把所选列的统计结果作为结果的一部分输出。

**医生、手术级别联合分组结果展示**

| 项               | 值  |
| ---------------- | --- |
| 刘医生；一级手术 | 13  |
| 刘医生；二级手术 | 15  |
| 刘医生；三级手术 | 19  |
| 刘医生；四级手术 | 0   |
| 李医生；一级手术 | 25  |
| 李医生；二级手术 | 3   |
| 李医生；三级手术 | 5   |
| 李医生；四级手术 | 1   |

**医生、手术级别分组结果展示**

| 项       | 值   |
| -------- | ---- |
| 曲强     | 3    |
| 侯睿     | 1    |
| 四级手术 | 1765 |
| 三级手术 | 859  |
| 二级手术 | 827  |
| 一级手术 | 98   |

从表现来看，我认为分组功能是多余的，理论上客户只需要联合分组。
多统计的需求是一定存在的，但不是逻辑上相互独立的统计，逻辑独立的统计理应单独计算。

### 统计案例分析

#### 案例一：主要诊断顺位表

**需求描述：**

按诊断病种<sup>[[4]](#编码类型)</sup>分组统计个数、平均住院天、平均总费用、平均西药费、西药费在费用中的占比。

**线索：**

1. 主诊是单独的字段，可直接使用
2. 顺位意思是需要排序，按照诊断的个数排序
3. Painless scripts[[5]](#Painless) 可以

**WSL**

```json
GET mrfs/_search
{
  "size": 0,
  "query": {
    "match_all": {}
  },
  "aggs": {
    "主要诊断顺位表": {
      "terms": {
        "script": {
          "lang": "painless",
          "source": """
            def prefix = '';
            if(doc['BaseDiagnosis.InternalICDCode.keyword'].size() > 0)
              prefix = doc['BaseDiagnosis.InternalICDCode.keyword'].value;
            if(prefix.length() > 5) prefix = prefix.substring(0, 5);
            return prefix
          """
        }
      },
      "aggs": {
        "平均住院天": {
          "avg": {
            "field": "InpatientDay"
          }
        },
        "平均总费用": {
          "avg": {
            "field": "Totalcost"
          }
        },
        "平均西药费": {
          "avg": {
            "field": "VFee.西药费"
          }
        },
        "西药费占比": {
          "bucket_script": {
            "buckets_path": {
              "x": "平均西药费",
              "z": "平均总费用"
            },
            "script": "params.x/params.z * 100"
          }
        }
      }
    }
  }
}
```

## 扩展阅读

### 编码类型

- 3 位：类目编码(category)
- 4 位：亚目编码(suborder)
- 5 位：细目编码(details)
- 6 位：扩展编码(extension)

考虑把这四种编码类型直接放入 ES 的 Diagnosis 当中

### Painless

Painless is a simple, secure scripting language designed specifically for use with Elasticsearch. It is the default scripting language for Elasticsearch and can safely be used for inline and stored scripts.

**example**

1. 通过诊断编码的前缀分组

```java
def prefix = '';
if(doc['BaseDiagnosis.InternalICDCode.keyword'].size() > 0)
    prefix = doc['BaseDiagnosis.InternalICDCode.keyword'].value;
if(prefix.length() > 5) prefix = prefix.substring(0, 5);
return prefix
```

2. 在度量计算值的基础之上计算新的值

```json
"平均住院天": {
    "avg": {
    "field": "InpatientDay"
    }
},
"平均总费用": {
    "avg": {
    "field": "Totalcost"
    }
},
"平均西药费": {
    "avg": {
    "field": "VFee.西药费"
    }
},
"西药费占比": {
    "bucket_script": {
    "buckets_path": {
        "x": "平均西药费",
        "z": "平均总费用"
    },
    "script": "params.x/params.z"
    }
}
```

## 其他

列

在统计系统当中，一个列就是一个表格中的列，它本身没有任何的确定性，只有当给列赋予一定的属性之后，列才成为一个有效的列。
