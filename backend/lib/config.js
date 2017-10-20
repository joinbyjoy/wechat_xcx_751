let env = process.env.NODE_ENV;
let wxSessionUrl = 'https://api.weixin.qq.com/sns/jscode2session?js_code={code}&appid={appid}&secret={secret}&grant_type=authorization_code',
    enviorment = {
        development: {
            appName: 'beta测试版',
            appId: 'your-key',
            appSecret: 'your-secret',
            appSessionUrl(code) {
                return wxSessionUrl
                    .replace('{code}', code)
                    .replace('{appid}', this.appId)
                    .replace('{secret}', this.appSecret);
            },
            project: 1,
            apiServer: 'http://localhost:3000',
            mysql: {
                connectionLimit: 64,
                host: "localhost",
                port: 3306,
                user: "your-username",
                password: "your-password",
                database: "your-database",
                dateStrings: true
            }
        },
        production: {
            appName: '生产环境',
            appId: "your-key",
            appSecret: "your-secret",
            appSessionUrl(code) {
                return wxSessionUrl
                    .replace('{code}', code)
                    .replace('{appid}', this.appId)
                    .replace('{secret}', this.appSecret);
            },
            project: 1,
            apiServer: 'https://www.your-server.com',
            mysql: {
                connectionLimit: 64,
                host: "localhost",
                port: 3306,
                user: "your-username",
                password: "your-password",
                database: "your-database",
                dateStrings: true
            }
        },
    };
module.exports = enviorment[env in enviorment ? env : 'development'];
