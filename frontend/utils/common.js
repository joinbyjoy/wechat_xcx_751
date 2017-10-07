// common.js

const EARTH_RADIUS = 6378137.0; ///*6378.137*/6371.004;

module.exports = {
    // api_server: 'http://localhost:3000/api751',
    api_server: 'https://www.your-server.com/api751',
    calcDistance(position1, position2) {
        var rad = function (d) {
            return d * Math.PI / 180.0;
        };
        var radLat1 = rad(position1.latitude);
        var radLat2 = rad(position2.latitude);
        var a = radLat1 - radLat2;
        var b = rad(position1.longitude) - rad(position2.longitude);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s *= EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    },
    mapControls(systemInfo) {
        let windowWidth = systemInfo.windowWidth,
            windowHeight = systemInfo.windowHeight,
            bigButtonSize = windowWidth / 375 * 64;
        return [{
            id: "changeGift",
            iconPath: "/resource/map-gift.png",
            position: {
                top: windowHeight - bigButtonSize * 5 / 4,
                left: (windowWidth - bigButtonSize) / 2,
                width: bigButtonSize,
                height: bigButtonSize
            },
            clickable: true
        }, {
            id: "showGamerule",
            iconPath: "/resource/map-question.png",
            position: {
                top: 10,
                left: windowWidth - 60,
                width: 50,
                height: 50
            },
            clickable: true
        }, {
            id: "setLocation",
            iconPath: "/resource/map-position.png",
            position: {
                top: windowHeight - 60,
                left: windowWidth - 60,
                width: 50,
                height: 50
            },
            clickable: true
        }];
    },
    request(apiName, data, callback) {
        if (typeof callback !== "function") {
            callback = function () {}
        }
        wx.request({
            url: this.api_server + apiName,
            method: 'POST',
            header: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            data: data,
            success(res) {
                callback(res.statusCode === 200 ? { data: res.data } : { error: true });
            },
            fail(e) {
                callback({ error: true });
            }
        });
    },
    setVisitorAction(visitor, action, result, callback) {
        this.request('/visitorActions', {
            visitor: visitor,
            action: action,
            result: result
        }, callback);
    },
    getVisitorInfo(visitor, callback) {
        this.request('/visitorAwards', { visitor: visitor }, callback);
    },
    getProjectSetting(visitor, callback) {
        this.request('/getProject', { visitor: visitor }, callback);
    }
}