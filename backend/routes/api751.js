var qr = require('qr-image'),
    router = require('express').Router(),
    utils = require(global.RootPath + '/lib/utils')('production');

// 获取项目配置，名称，中心点，。。。
router.post('/getProject', function (req, res, next) {
    utils.getProject().then(function (data) {
        res.json(data);
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 检查用户 uuid 是否存在，没有告诉客户端刷新，重新生成
router.post('/checkVisitor', function (req, res, next) {
    utils.checkVisitor(req.body.visitor).then(function (data) {
        res.json(data[0] || { uuid: false });
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 创建用户信息
router.post('/createVisitor', function (req, res, next) {
    utils.createVisitor(req.body).then(function (data) {
        res.json(data[0]);
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 获取地图点
router.post('/mapMarkers', function (req, res, next) {
    utils.getMapMarkers(req.body.visitor).then(function (data) {
        res.json(data);
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 签到地点
router.post('/signinPlace', function (req, res, next) {
    utils.signinPlace(req.body).then(function (data) {
        res.json(data);
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 用户动作
router.post('/visitorActions', function (req, res, next) {
    utils.setVisitorAction(req.body).then(function (data) {
        res.json({ status: 'done' });
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 选择题库开始答题
router.post('/fetchQuestions', function (req, res, next) {
    utils.fetchQuestions(req.body.groupId).then(function (data) {
        res.json(data);
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 获奖信息
router.post('/visitorAwards', function (req, res, next) {
    utils.getVisitorAwardInfo(req.body.visitor).then(function (data) {
        res.json(data);
    }).catch(function (error) {
        console.log(error)
        res.json({ error: error });
    });
});

// 兑奖时出示的二维码
router.get('/exchange-:uuid', function (req, res, next) {
    var uuid = req.params.uuid;
    var code = qr.image(utils.config.apiServer + req.baseUrl + '/visitor-awards-' + uuid, { type: 'png' });
    res.setHeader('Content-type', 'image/png');
    code.pipe(res);
});

// 二维码扫描后的汇总结果
router.get('/visitor-awards-:uuid', function (req, res, next) {
    utils.summuryInfo(req.params.uuid).then(data => {
        res.render('index', {
            server_api: req.baseUrl + '/adminActions',
            data: JSON.stringify(data)
        });
    }).catch(function (error) {
        console.log(error);
        res.json({ error: error });
    });
});

router.post('/adminActions', function (req, res, next) {
    let visitor = req.body.visitor,
        method = req.body.method,
        action = req.body.action,
        result = req.body.result;
    if (method == 'append') {
        utils.query('INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?, stamp=now();', [
            'visitor_log', { visitor: visitor, action: action, result: result }, { result: result }
        ]).then(function (data) {
            res.json({
                data: new Date().format(),
                status: 'done'
            });
        }).catch(function (e) {
            res.json({ error: e });
        });
    } else if (method == 'update' && action == 'mobile') {
        utils.query("UPDATE ?? SET ? WHERE ? LIMIT 1", [
            'visitors', { mobile: result }, { uuid: visitor }
        ]).then(() => {
            res.json({ data: result });
        });
    } else {
        res.json({ error: 'unknown' });
    }
});

router.post('/adminActions4444', function (req, res, next) {
    let visitor = req.body.visitor,
        method = req.body.method,
        action = req.body.action,
        result = req.body.result;
    if (method == 'clear') {
        if (action == 'basicGiftRecieved' || action == 'upgradeGiftRecieved') {
            utils.query('DELETE FROM ?? WHERE ? AND ?', [
                'visitor_log', { visitor: visitor }, { action: action }
            ]).then(function (data) {
                res.json({
                    status: 'done'
                })
            }).catch(console.log)
        } else if (action == 'clearSingedPlace') {
            utils.query('DELETE FROM ?? WHERE ?', [
                'place_signed', { visitor: visitor }
            ]).then(function (data) {
                res.json({
                    status: 'done'
                })
            }).catch(console.log)
        }
    } else if (method == 'append') {
        utils.query('INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?, stamp=now();', [
            'visitor_log', { visitor: visitor, action: action, result: result }, { result: result }
        ]).then(function (data) {
            res.json({
                data: new Date().format(),
                status: 'done'
            });
        }).catch(function (e) {
            res.json({ error: e });
        });
    } else {
        res.json({ error: 'unknown' });
    }
});

module.exports = router;