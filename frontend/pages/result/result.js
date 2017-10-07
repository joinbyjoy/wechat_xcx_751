// result.js

let appData = getApp().globalData,
    common = getApp().common;
Page({
    data: {
        loadingComplete: false,
        detail: "读取中 ...",
        extra: "读取中 ..."
    },
    onShow() {
        wx.showLoading({
            title: '读取中 ...',
            mask: true
        });
        common.getVisitorInfo(appData.uuid, res => {
            var questionInfo = appData.questionGroups.filter(group => {
                return group.uuid == res.data.questionGroupSelected;
            }).pop();
            this.setData({
                loadingComplete: true,
                upgradeGiftRecieved: res.data.upgradeGiftRecieved,
                waitingForExchange: res.data.waitingForExchange,
                questionGroupSelected: res.data.questionGroupSelected,
                detail: questionInfo.detail,
                extra: questionInfo.extra
            });
            wx.hideLoading();
        });
    },
    changePrize() {
        wx.navigateTo({ url: '/pages/prize/prize' });
    },
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
    reLaunchGame() {
        wx.reLaunch({ url: '/pages/map/map' });
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});