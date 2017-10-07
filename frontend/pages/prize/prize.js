// prize.js
let appData = getApp().globalData,
    common = getApp().common;
Page({
    data: {
        ExchangeReward: "/resource/empty.png"
    },
    onReady() {
        setTimeout(() => {
            this.setData({ ExchangeReward: common.api_server + '/exchange-' + appData.uuid });
        }, 100);
    },
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});