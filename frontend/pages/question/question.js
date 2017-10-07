// // question.js
let timerCounter = null,
    visitorAnswers = [],
    appData = getApp().globalData,
    common = getApp().common;

Page({
    data: {
        loadingComplete: false,
        Questions: [],
        currentIndex: 0,
        questionButtonText: "下一题",
        remainSeconds: appData.questionLastTime
    },
    onLoad() {
        wx.showLoading({
            title: '读取中 ...',
            mask: true
        });
        common.request('/fetchQuestions', {
            visitor: appData.uuid,
            groupId: appData.questionGroupSelected
        }, (res) => {
            this.setData({
                Questions: res.data
            });
            wx.hideLoading();
            this.countDown();
        });
    },
    countDown() {
        clearInterval(timerCounter);
        this.setData({ remainSeconds: appData.projectSetting.answerTimeLimit });
        timerCounter = setInterval(() => {
            let remainSeconds = this.data.remainSeconds - 1;
            if (remainSeconds > 0) {
                this.setData({ remainSeconds: remainSeconds });
            } else {
                let index = this.data.currentIndex,
                    answer = visitorAnswers[index];
                if (answer === undefined) {
                    visitorAnswers[index] = '';
                }
                this.nextQuestion();
            }
        }, 1000);
    },
    nextQuestion() {
        let index = this.data.currentIndex,
            total = this.data.Questions.length - 1,
            answer = visitorAnswers[index];
        if (answer === undefined) {
            return wx.showToast({ title: '请选择答案', icon: 'loading' });
        }
        index++;
        this.countDown();
        if (index < total) {
            this.setData({
                currentIndex: index
            });
        } else if (index == total) {
            this.setData({
                currentIndex: index,
                questionButtonText: '完 成'
            });
        } else {
            clearInterval(timerCounter);
            common.setVisitorAction(appData.uuid, 'finishedAnswer', visitorAnswers.join(), (res) => {
                wx.redirectTo({ url: "/pages/result/result" });
            });
        }
    },
    answerSelect(e) {
        let index = this.data.currentIndex;
        visitorAnswers[index] = e.detail.value;
    },
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
    onShareAppMessage() {
        return appData.ShareMessage;
    }
});