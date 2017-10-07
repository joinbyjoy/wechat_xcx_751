let wxSessionUrl = 'https://api.weixin.qq.com/sns/jscode2session?js_code={code}&appid={appid}&secret={secret}&grant_type=authorization_code',
    config = {
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
                connectionLimit: 4,
                host: "localhost",
                port: 3306,
                user: "your-username",
                password: "your-password",
                database: "your-database",
                dateStrings: true
            }
        },
        beta: {
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
                connectionLimit: 4,
                host: "localhost",
                port: 3306,
                user: "your-username",
                password: "your-password",
                database: "your-database",
                dateStrings: true
            }
        }
    };
module.exports = function (app) {
    return config[app ? app : 'beta'];
}