//app.js
let common = require("/utils/common.js");
App({
    common: common,
    onLaunch() {
        let appData = this.globalData;
        // 获取系统信息，主要使用屏幕宽度高度
        wx.getSystemInfo({
            success(res) {
                appData.systemInfo = res;
            }
        });
    },
    onShow() {
        let appData = this.globalData;
        appData.uuid = wx.getStorageSync('uuid');
        common.request('/checkVisitor', { visitor: appData.uuid }, (res) => {
            if (appData.uuid !== res.data.uuid) {
                this.createVisitor();
            }
        });
        common.getProjectSetting(appData.uuid, function (res) {
            appData.projectSetting = res.data.settings;
            appData.questionGroups = res.data.questionGroups;
            appData.ShareMessage.title = res.data.settings.shareTitle;
            appData.ShareMessage.imageUrl = res.data.settings.shareImage;
        });
    },
    createVisitor() {
        let appData = this.globalData;
        wx.login({
            success(lInfo) {
                wx.getUserInfo({
                    success(uInfo) {
                        common.request('/createVisitor', {
                            code: lInfo.code,
                            iv: uInfo.iv,
                            crypted: uInfo.encryptedData,
                            systemInfo: JSON.stringify(appData.systemInfo)
                        }, function (res) {
                            appData.uuid = res.data.uuid;
                            wx.setStorageSync('uuid', res.data.uuid);
                        });
                    },
                    fail() {
                        common.request('/createVisitor', {
                            code: lInfo.code,
                            systemInfo: JSON.stringify(appData.systemInfo)
                        }, function (res) {
                            appData.uuid = res.data.uuid;
                            wx.setStorageSync('uuid', res.data.uuid);
                        });
                    }
                });
            }
        });
    },
    globalData: {
        ShareMessage: {
            path: '/pages/welcome/welcome',
            title: '尚隐带你玩转北京751国际设计节',
            imageUrl: '/resource/share.jpg'
        },
        uuid: null,
        systemInfo: {},
        projectSetting: {},
        questionGroups: [],
        signedNumber: 0,
        // 传递参数使用
        openPlace: null
    }
});