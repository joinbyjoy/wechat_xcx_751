// map.js

let appData = getApp().globalData,
    common = getApp().common;

Page({
    data: {
        signedNumber: appData.signedNumber,
        signedNeeded: appData.signedNumber,
        scale: 15,
        markers: []
    },
    onLoad() {
        // 打开页面的时候判断当前位置，当前点距系统预设中心小于预设距离的情况，定位到当前位置，否则定位到预设位置
        let self = this;
        wx.getLocation({
            type: "gcj02",
            success: function (res) {
                let distance = common.calcDistance(res, appData.projectSetting);
                if (distance < appData.projectSetting.centerRadius) {
                    // 小于预设距离，定位到当前位置
                    self._setMapPosition(res);
                } else {
                    // 大于预设距离，定位到预设位置
                    self._setMapPosition(appData.projectSetting);
                }
            },
            fail() {
                // 未授权使用地理位置，定位到预设位置
                self._setMapPosition(appData.projectSetting);
            }
        });
        this.setData({
            scale: appData.projectSetting.scale
        });
    },
    onShow() {
        // 获取签到点及当前用户签到情况
        common.request('/mapMarkers', {
            visitor: appData.uuid
        }, (markers) => {
            appData.signedNumber = 0;
            this.setData({
                markers: markers.data.map((mark, i) => {
                    appData.signedNumber += !!mark.signed;
                    return {
                        id: mark.uuid,
                        latitude: mark.latitude,
                        longitude: mark.longitude,
                        iconPath: mark.iconPath,
                        width: mark.icon_width,
                        height: mark.icon_height,
                        picture: mark.picture,
                        signed: !!mark.signed
                    };
                }),
                controls: common.mapControls(appData.systemInfo),
                signedNeeded: appData.projectSetting.signedNeeded,
                signedNumber: appData.signedNumber
            });
        });
    },
    _setMapPosition(position) {
        this.setData({
            latitude: position.latitude,
            longitude: position.longitude
        });
    },
    // 导航到兑奖页面
    changeGift() {
        wx.navigateTo({ url: "/pages/change/change" });
    },
    // 控件点击时触发对应操作
    controltap(e) {
        // e.controlId 对应下列方法
        this[e.controlId]();
    },
    /** MapControls 地图控件 **/
    // 定位当前位置
    setLocation() {
        let self = this;
        wx.getLocation({
            type: "gcj02",
            success: function (res) {
                // 授权定位
                self._setMapPosition(res);
            },
            fail() {
                // 未授权
                wx.showToast({
                    title: '未授权定位',
                    icon: 'loading',
                    mask: true
                });
            }
        });
    },
    // 点击地图位置，导航到展示页
    showMarkerPlace(e) {
        appData.openPlace = this.data.markers.filter(mark => {
            return mark.id == e.markerId;
        }).pop();
        wx.navigateTo({ url: "/pages/place/place" });
    },
    // 导航到游戏说明页
    showGamerule() {
        wx.navigateTo({ url: "/pages/welcome/welcome?back=true" });
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});