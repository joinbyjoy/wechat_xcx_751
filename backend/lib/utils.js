var crypto = require("crypto"),
    https = require("https"),
    mysql = require("mysql"),
    config = require('./config'),
    _pool = mysql.createPool(config.mysql);

Date.prototype.format = function (tpl = 'yyyy-mm-dd hh:ii:ss') {
    [
        [/y+/g, this.getFullYear()],
        [/m+/g, this.getMonth() + 1],
        [/d+/g, this.getDate()],
        [/h+/g, this.getHours()],
        [/i+/g, this.getMinutes()],
        [/s+/g, this.getSeconds()],
        [/D+/g, '日一二三四五六日'.split('')[this.getDay()]]
    ].map(function (s) {
        tpl = tpl.replace(s[0], p => ("0" + s[1]).slice(-p.length));
    });
    return tpl;
};

function util(config) {
    _pool.on('enqueue', () => {
        console.log('\x1b[36m%s\x1b[0m', 'Mysql: Waiting for available connection slot');
    });
};

util.prototype = {
    format(sql, args) {
        let result = mysql.format(sql, args);
        // console.log('\x1b[36m%s\x1b[0m', result);
        return Promise.resolve(result);
    },
    query(sql, args) {
        return new Promise((resolve, reject) => {
            _pool.query(sql, args, (error, results, fields) => {
                error ? reject(error) : resolve(results);
            });
        });
    },
    fetchSession(code) {
        var session_url = config.appSessionUrl(code);
        return new Promise((resolve, reject) => {
            https.request(session_url, (res) => {
                var datas = [],
                    size = 0;
                res.on('data', (chunk) => {
                    datas.push(chunk);
                    size += chunk.length;
                }).on('end', () => {
                    resolve(JSON.parse(Buffer.concat(datas, size).toString()));
                })
            }).on('error', reject).end();
        });
    },
    decodeUnionInfo(key, iv, crypted) {
        key = new Buffer(key, 'base64');
        iv = new Buffer(iv, 'base64');
        crypted = new Buffer(crypted, 'base64');
        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);
        var decoded = decipher.update(crypted, 'binary', 'utf8');
        decoded += decipher.final('utf8');
        decoded = JSON.parse(decoded);
        decoded.watermark = (decoded.watermark.appid == config.appId);
        return decoded;
    },
    getProject() {
        return Promise.all([
            this.query("SELECT * FROM ?? WHERE ?", ['project', { id: config.project }]),
            this.query('SELECT ?? FROM ?? WHERE ? ORDER BY ??', [
                ['uuid', 'name', 'detail', 'extra'], 'question_group', { project_id: config.project }, 'sort'
            ])
        ]).then(results => {
            let settings = results[0][0];
            delete settings.id;
            delete settings.create_time;
            return Promise.resolve({
                settings: settings,
                questionGroups: results[1]
            });
        });
    },
    checkVisitor(visitor) {
        return this.query("SELECT uuid FROM ?? WHERE ?", [
            'visitors', { uuid: visitor }
        ]);
    },
    createVisitor(info) {
        var newVisitor = {
            project_id: config.project,
            openid: null,
            unionid: null,
            rawdata: null,
            systemInfo: info.systemInfo
        };
        return this.fetchSession(info.code).then(openInfo => {
            newVisitor.openid = openInfo.openid;
            if (info.iv) {
                var userInfo = this.decodeUnionInfo(openInfo.session_key, info.iv, info.crypted);
                newVisitor.unionid = userInfo.unionId;
                newVisitor.rawdata = new Buffer(JSON.stringify(userInfo)).toString('base64');
                return this.query("INSERT INTO ?? SET ??=uuid(), ? ON DUPLICATE KEY UPDATE ?", [
                    'visitors', 'uuid', newVisitor, newVisitor
                ]);
            } else {
                return this.query("INSERT IGNORE INTO ?? SET ??=uuid(), ?", [
                    'visitors', 'uuid', newVisitor
                ]);
            }
        }).then(noop => {
            return this.query('SELECT ?? FROM ?? WHERE ? AND ?', [
                'uuid', 'visitors',
                { project_id: config.project }, { openid: newVisitor.openid }
            ]);
        });
    },
    getMapMarkers(visitor) {
        return this.query("SELECT ??, " +
            "IF (??!='', ??, ??) AS ??, " +
            "IF (??!='', 1, 0) AS ?? " +
            "FROM ?? AS `a` LEFT JOIN ?? AS `b` " +
            "ON (`uuid`=`placeid` AND ?) " +
            "WHERE ? AND ?", [
                ['uuid', 'a.latitude', 'a.longitude', 'icon_width', 'icon_height', 'picture'],
                'visitor', 'signed_icon', 'unsigned_icon', 'iconPath',
                'visitor', 'signed', 'places', 'place_signed',
                { visitor: visitor }, { project_id: config.project }, { closed: 0 }
            ]);
    },
    signinPlace(data) {
        return this.query("INSERT IGNORE INTO ?? SET ?", [
            'place_signed', data
        ]);
    },
    setVisitorAction(detail) {
        if (detail.action == 'finishedAnswer') {
            let stopAnswer = new Date().valueOf();
            // 检查用户答题的答案，如果有则判断是或否正确
            this.query("SELECT ??, group_concat(?? ORDER BY ??) AS ?? " +
                "FROM ?? AS a INNER JOIN ?? AS b INNER JOIN ?? AS c " +
                "ON (?? = ?? AND ?? = ?? AND ? AND ?) GROUP BY ??", [
                    'stamp', 'answer', 'a.sort', 'answers',
                    'questions', 'question_group', 'visitor_log',
                    'group_id', 'b.id', 'result', 'uuid',
                    { visitor: detail.visitor }, { action: 'challengeWithQuestionGroup' }, 'group_id'
                ]).then(data => {
                if (data.length) {
                    let answers = data[0].answers.split(',');
                    this.query("SELECT ?? FROM ?? WHERE ?", [
                        ['answerTimeLimit', 'minCorrectNum'], 'project', { id: config.project }
                    ]).then(setting => {
                        let startAnswer = Date.parse(data[0].stamp);
                        if (stopAnswer - startAnswer <= (setting[0].answerTimeLimit * answers.length + 20) * 1000) {
                            let correctAnswerNum = detail.result.split(',').filter((a, i) => {
                                return a === answers[i];
                            }).length;
                            if (correctAnswerNum >= setting[0].minCorrectNum) {
                                this.setVisitorAction({
                                    visitor: detail.visitor,
                                    action: 'waitingForExchange',
                                    result: correctAnswerNum
                                });
                            }
                        }
                    }).catch(console.log);
                }
            });
        }
        return this.query('INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?, `stamp`=NOW();', [
            'visitor_log', detail, { result: detail.result }
        ]);
    },
    fetchQuestions(groupid) {
        return this.query('SELECT ?? FROM ?? AS `a` ' +
            'LEFT JOIN ?? AS `b` ON (?? = ??) ' +
            'WHERE ? ORDER BY ??', [
                ['a.id', 'title', 'choices', 'answer'], 'questions',
                'question_group', 'group_id', 'b.id',
                { 'b.uuid': groupid }, 'a.sort'
            ]).then(questions => {
            let result = [];
            questions.map((q) => {
                result.push({
                    title: q.title,
                    choices: q.choices.split(','),
                    answer: q.answer
                });
            });
            return Promise.resolve(result);
        });
    },
    getVisitorAwardInfo(visitor) {
        return this.query("SELECT ?? FROM ?? WHERE ?", [
            ['action', 'result', 'stamp'], 'visitor_log', { visitor: visitor }
        ]).then((logs) => {
            var result = {
                basicGiftRecieved: false,
                upgradeGiftRecieved: false,
                waitingForExchange: false,
                forbidTodayAnswer: false,
                questionGroupSelected: ''
            };
            logs.map(log => {
                if (log.action == 'basicGiftRecieved') { // 是否已领纪念奖
                    result.basicGiftRecieved = true;
                } else if (log.action == 'upgradeGiftRecieved') { // 是否已领升级奖
                    result.upgradeGiftRecieved = true;
                } else if (log.action == 'waitingForExchange') { // 等待领奖
                    result.waitingForExchange = true;
                } else if (log.action == 'challengeWithQuestionGroup') { // 是否已经答题
                    result.forbidTodayAnswer = (new Date().valueOf() < Date.parse(log.stamp.substr(0, 10)) + 864e5);
                    if (result.forbidTodayAnswer) {
                        result.questionGroupSelected = log.result;
                    } else {
                        result.questionGroupSelected = '';
                    }
                }
            });
            return Promise.resolve(result);
        });
    },
    summuryInfo(visitor) {
        var systemInfo = {},
            result = {
                uuid: visitor,
                mobile: null,
                signedPlace: [],
                signedNeeded: 10,
                basicGiftRecieved: false,
                upgradeGiftRecieved: false,
                questionInfo: {
                    name: '',
                    detail: '',
                    extra: '',
                    start: '',
                    stop: '',
                    duration: '-',
                    timeLimit: 0,
                    correct: 0,
                    needCorrect: ''
                }
            };
        return this.getProject().then(info => {
            systemInfo = info;
            result.signedNeeded = info.settings.signedNeeded;
            result.questionInfo.timeLimit = info.settings.answerTimeLimit;
            result.questionInfo.needCorrect = info.settings.minCorrectNum;
            return this.query("SELECT ?? FROM ?? INNER JOIN ?? ON (?? = ?? AND ? AND ?) ORDER BY ??", [
                ['name', 'stamp'], 'place_signed', 'places', 'placeid', 'uuid', { closed: 0 }, { visitor: visitor }, 'stamp'
            ]);
        }).then(signedPlace => {
            result.signedPlace = signedPlace;
            return this.query("SELECT ?? FROM ?? WHERE ? ORDER BY ??", [
                ['action', 'result', 'stamp'], 'visitor_log', { visitor: visitor }, 'id'
            ]);
        }).then(logs => {
            let questionInfo = result.questionInfo,
                visitorAnswer = false;
            logs.map(log => {
                switch (log.action) {
                case 'basicGiftRecieved':
                    result.basicGiftRecieved = log.stamp;
                    break;
                case 'upgradeGiftRecieved':
                    result.upgradeGiftRecieved = log.stamp;
                    break;
                case 'challengeWithQuestionGroup':
                    let question = systemInfo.questionGroups.filter(q => {
                        return q.uuid == log.result;
                    }).pop();
                    questionInfo.uuid = question.uuid;
                    questionInfo.name = question.name;
                    questionInfo.detail = question.detail;
                    questionInfo.extra = question.extra;
                    questionInfo.start = log.stamp;
                    break;
                case 'finishedAnswer':
                    questionInfo.stop = log.stamp;
                    questionInfo.duration = Math.round((Date.parse(questionInfo.stop) - Date.parse(questionInfo.start)) / 1000);
                    visitorAnswer = log.result;
                    break;
                default:
                }
            });
            if (visitorAnswer !== false) {
                return this.fetchQuestions(questionInfo.uuid).then(answers => {
                    let answer = visitorAnswer.split(',');
                    questionInfo.timeLimit *= (answers.length + 1);
                    answers.map((a, i) => {
                        questionInfo.correct += (a.answer == answer[i]);
                    });
                });
            } else {
                return Promise.resolve();
            }
        }).then(() => {
            return this.query("SELECT ?? FROM ?? WHERE ? AND ?", [
                'mobile', 'visitors', { uuid: visitor }, { project_id: config.project }
            ]);
        }).then(uInfo => {
            result.mobile = uInfo.length && uInfo.pop().mobile || null;
            return Promise.resolve(result);
        });
    }
};

module.exports = new util();