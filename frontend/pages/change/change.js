// change.js

let appData = getApp().globalData,
    common = getApp().common;
Page({
    data: {
        loadingComplete: false,
        basicGiftInfo: appData.basicGiftInfo,
        signedNeeded: appData.projectSetting.signedNeeded,
        signedNumber: appData.signedNumber,
        basicGiftRecieved: false,
        upgradeGiftRecieved: false,
        waitingForExchange: false,
        forbidTodayAnswer: false
    },
    onShow() {
        wx.showLoading({
            title: '读取中 ...',
            mask: true
        });
        let self = this;
        common.getVisitorInfo(appData.uuid, (res) => {
            self.setData({
                loadingComplete: true,
                basicGiftInfo: appData.projectSetting.giftDetail,
                signedNeeded: appData.projectSetting.signedNeeded,
                signedNumber: appData.signedNumber,
                basicGiftRecieved: res.data.basicGiftRecieved, // 已领奖
                upgradeGiftRecieved: res.data.upgradeGiftRecieved, // 已经兑换大奖
                waitingForExchange: res.data.waitingForExchange, // 等待领奖
                forbidTodayAnswer: res.data.forbidTodayAnswer // 挑战失败
            });
            wx.hideLoading();
        });
    },
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
    toastHaveBaisc() {
        wx.showToast({ title: '已领取纪念奖' });
    },
    toastHaveUpgrade() {
        wx.showToast({ title: '已领取升级奖' });
    },
    changeBaiscGift() {
        wx.navigateTo({ url: '/pages/prize/prize' });
    },
    answerQuestion() {
        wx.navigateTo({ url: '/pages/upgrade/upgrade' });
    },
    goCheckResult() {
        wx.navigateTo({ url: '/pages/result/result' });
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});