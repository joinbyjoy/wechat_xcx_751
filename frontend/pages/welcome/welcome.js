// welcome.js
let appData = getApp().globalData,
    common = getApp().common;
Page({
    firstOpen: true,
    onLoad(options) {
        if (options.back === 'true') {
            this.firstOpen = false;
        }
    },
    openMap() {
        if (this.firstOpen) {
            wx.redirectTo({ url: '/pages/map/map' });
        } else {
            wx.navigateBack({ delta: 1 });
        }
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});