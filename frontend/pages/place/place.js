// place.js

//获取应用实例
let timer = null,
    appData = getApp().globalData,
    common = getApp().common;
Page({
    data: {
        hideResult: true,
        result: {
            title: '',
            content: ''
        },
        buttonText: "签 到",
        placeImage: "/resource/empty.png"
    },
    onReady() {
        timer = setTimeout(() => {
            this.setData({
                buttonText: appData.openPlace.signed ? "已 签 到" : "签 到",
                placeImage: appData.openPlace.picture
            });
        }, 100);
    },
    onUnload() {
        clearTimeout(timer);
    },
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
    _showTip(title, content) {
        this.setData({
            hideResult: false,
            result: {
                title: title,
                content: content
            }
        });
    },
    _goGetPrize() {
        timer = setTimeout(function () {
            wx.redirectTo({ url: '/pages/change/change' });
        }, 2000);
    },
    signAndBack() {
        wx.showLoading({
            title: '签到中 ...',
            mask: true
        });
        let self = this,
            mark = appData.openPlace,
            signedNumber = appData.signedNumber,
            signedNeeded = appData.projectSetting.signedNeeded,
            signinRadius = appData.projectSetting.signinRadius;
        if (mark.signed) {
            wx.hideLoading()
            if (signedNumber < signedNeeded) {
                self._showTip('已成功签到', '再签到 ' + (signedNeeded - signedNumber) + ' 个地方，就可以兑奖了，到别的地方转转吧');
                timer = setTimeout(function () {
                    self.navigateBack();
                }, 2000);
            } else {
                self._showTip('已成功签到', '您已经完成了签到任务，可以去兑换奖品了');
                self._goGetPrize();
            }
        } else {
            wx.getLocation({
                type: "gcj02",
                success: function (position) {
                    let distance = common.calcDistance(mark, position);
                    if (distance <= signinRadius) {
                        common.request('/signinPlace', {
                            visitor: appData.uuid,
                            placeid: mark.id,
                            longitude: position.longitude,
                            latitude: position.latitude
                        }, function (res) {
                            if (res.data) {
                                appData.signedNumber = signedNumber + 1;
                                signedNumber = appData.signedNumber;
                                if (signedNumber < signedNeeded) {
                                    self._showTip('签到成功', '您已经成功签到 ' + signedNumber + ' 处，再签到 ' + (signedNeeded - signedNumber) + ' 处可以兑换奖品');
                                    timer = setTimeout(function () {
                                        self.navigateBack();
                                    }, 2000);
                                } else {
                                    self._showTip('签到成功', '恭喜您，已经完成了签到任务，马上去兑换奖品吧');
                                    self._goGetPrize();
                                }
                            } else {
                                self._showTip('签到失败', '服务器说它没反应过来，请稍候再试');
                                timer = setTimeout(function () {
                                    self.setData({ hideResult: true });
                                }, 2000);
                            }
                            wx.hideLoading();
                        });
                    } else {
                        self._showTip('签到失败', '您距离签到点太远了，请再走近一些');
                        timer = setTimeout(function () {
                            self.setData({ hideResult: true });
                        }, 2000);
                        wx.hideLoading();
                    }
                },
                fail() {
                    wx.showToast({
                        title: '未授权定位',
                        icon: 'loading',
                        mask: true
                    });
                }
            });
        }
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});