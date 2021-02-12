const { Service } = require("egg");
const fs = require("fs");
const axios = require("axios");
const env = require("../env");
const { redis } = require("../config")[env];

class RedisService extends Service {
    async post(key, value) {
        if (redis.enable) {
            const res = await axios.post("http://" + redis.host + "/api/values/add", {
                key,
                describe: "统计系统临时查询包",
                obj: value,
            });
            return res;
        } else {
            fs.writeFileSync(`pkg/${key}.json`, value);
        }
    }
    async delete(key) {
        console.log(key);
    }
    async put(key, value) {
        console.log(key, value);
    }
    async get(key) {
        if (redis.enable) {
            let res = await axios.get('http://' + redis.host + "/api/values/get?key=" + key);
            return res.data;
        } else {
            let res = fs.readFileSync(`pkg/${key}.json`, "utf-8");
            return res;
        }
    }
}

module.exports = RedisService;
