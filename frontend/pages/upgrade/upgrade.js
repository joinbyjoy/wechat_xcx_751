// upgrade.js

let appData = getApp().globalData,
    common = getApp().common;
Page({
    data: {
        loadingComplete: false,
        hideAlert: true,
        Title: '闯关得好礼',
        subTitle: '请选择题库：',
        Alert: {
            title: '请选择题库',
            content: '挑选您认为最擅长的类型答题'
        },
        answerTimeLimit: 0,
        questionGroups: [],
        questionGroupSelected: ''
    },
    onShow() {
        wx.showLoading({
            title: '读取中 ...',
            mask: true
        });
        common.getVisitorInfo(appData.uuid, data => {
            var questionGroups = appData.questionGroups;
            if (data.questionGroupSelected) {
                questionGroups = questionGroups.filter(group => {
                    return group.uuid == data.questionGroupSelected;
                });
                this.setData({
                    Title: '挑战未完成',
                    subTitle: '请继续挑战'
                })
            }
            this.setData({
                loadingComplete: true,
                questionGroups: questionGroups,
                answerTimeLimit: appData.projectSetting.answerTimeLimit,
                questionGroupSelected: data.questionGroupSelected,
                continueWithQestionId: data.continueWithQestionId
            });
            wx.hideLoading();
        });
    },
    startAnswer() {
        var questionGroupSelected = this.data.questionGroupSelected;
        if (!questionGroupSelected) {
            this.setData({ hideAlert: false });
            setTimeout(() => {
                this.setData({ hideAlert: true });
            }, 1000);
        } else {
            wx.showModal({
                title: '答题规则',
                content: '每道题限时 20s，超时自动跳转下一题，中途退出算挑战失败',
                confirmText: '开始挑战',
                cancelText: '一会再来',
                success: function (res) {
                    if (res.confirm) {
                        common.setVisitorAction(appData.uuid, 'challengeWithQuestionGroup', questionGroupSelected, (res) => {
                            wx.redirectTo({ url: "/pages/question/question" });
                        });
                    }
                }
            });
        }
    },
    buttonTap(e) {
        appData.questionGroupSelected = e.currentTarget.id;
        this.setData({
            questionGroupSelected: e.currentTarget.id
        });
    },
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});