module.exports = {
    gs: {
        es: {
            host: "172.30.199.41:9200",
            index: "mrfs",
            apiVersion: "7.6",
        },
        redis: {
            host: "xhdev.docimaxvip.com:6638", // 公司
            enable: true,
        },
        mrquery: {
            host: "172.30.199.163",
            user: "sa",
            pwd: "Docimax@123",
            db: "MRFSQuery",
            env: "",
        },
        mrfs: {
            host: "172.30.199.163",
            user: "sa",
            pwd: "Docimax@123",
            db: "MR_FS_DB",
            env: "",
        },
        security: {
            host: "172.30.199.163",
            user: "sa",
            pwd: "Docimax@123",
            db: "",
        },
        mongo: {
            host: "172.30.199.41:27017",
            user: "admin",
            pwd: "Docimax123",
            db: ''
        },
    },
    xh: {
        es: {
            host: "10.160.12.34:9200",
            index: "mr5",
            apiVersion: "7.6",
        },
        redis: {
            host: "10.160.12.35:6638",
            enable: false,
        },
        mrquery: {
            host: "10.160.12.19",
            user: "sa",
            pwd: "Docimax@123",
            db: "MRFSQuery",
            env: "",
        },
        mrfs: {
            host: "10.160.12.19",
            user: "sa",
            pwd: "Docimax@123",
            db: "MR_FS_DB",
            env: "",
        },
        security: {
            host: "10.160.12.19",
            user: "sa",
            pwd: "Docimax@123",
            db: "",
        },
        mongo: {
            host: "10.160.12.215:27017",
            user: "admin",
            pwd: "Docimax123",
            db: '',
        },
    },
};
