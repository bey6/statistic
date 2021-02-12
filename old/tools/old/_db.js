module.exports.getQueryResult = async function (strsql, getConnectionPool) {
  try {
    console.log(strsql);
    let r = await getConnectionPool().request().query(strsql).recordset;
    console.log(r);
    return r;
  } catch (error) {
    console.log(error);
  } finally {
    console.log('query finished');
    //await sqlserver.close();
  }
};

// module.exports.getIdString = function (pre) {
//     let id = pre;
//     let s = new Date();
//     id +=
//         s.getFullYear().toString() +
//         s.getMonth().toString() +
//         s.getDay().toString() +
//         s.getHours().toString();
//     id +=
//         s.getMinutes().toString() +
//         s.getSeconds().toString() +
//         s.getMilliseconds().toString() +
//         Math.round(Math.random() * 1000).toString();
//     return id.slice(0, 20);
// }

module.exports.needQuator = function (value) {
  if (typeof value === 'string') return true;
  if (value instanceof Date) return true;
  return false;
};

translog: []; // log vbase id to save trans result and trans time

module.exports.getExtSql = function (id, fkey, table) {
  var sql = 'select * from ' + table + ' where ' + fkey + "='" + id + "'";
  return sql;
};
module.exports.getExt = async function (id, fkey, table, getConnection, additionalProcess, base, saveCount) {
  data = [];
  var sql = this.getExtSql(id, fkey, table);
  var r = await getConnection().request().query(sql);

  r.recordset.forEach((d) => {
    delete d[fkey];
    if (additionalProcess !== undefined)
      additionalProcess(base, d)
    data.push(d);
  });

  return data;
};
module.exports.processOrderBase = async function (id, fkey, table, getConnection, baseObject, baseCol, orderCol, additionalProcess, saveCount) {
  data = [];
  var sql = this.getExtSql(id, fkey, table);
  var r = await getConnection().request().query(sql);
  if (saveCount !== undefined)
    saveCount(baseObject, r.recordset, table)
  r.recordset.forEach((d) => {
    delete d[fkey];
    // data.push(d);
    if (d[orderCol] === 1) {
      if (additionalProcess !== undefined)
        additionalProcess(baseObject, d)
      baseObject[baseCol] = JSON.parse(JSON.stringify(d))
    }
  });

  //return data;
};
module.exports.getExtWithType = async function (
  id,
  fkey,
  table,
  typecol,
  valuecol,
  usecols,
  getConnection
) {
  data = [];
  var sql = this.getExtSql(id, fkey, table);
  var r = await getConnection().request().query(sql);

  r.recordset.forEach((d) => {
    let nd = {};
    let key = d[typecol];
    var value = d[valuecol];
    nd[key] = value;
    usecols.forEach((c) => {
      console.log(d[c]);
      nd[c] = d[c];
    });
    data.push(nd);
  });
  return data;
};
