//index.js
const app = getApp()
const { envList } = require('../../envList.js')

const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    video: {
      poster: "https://636c-cloud1-2gwp6tvi4796d170-1307772281.tcb.qcloud.la/poster/1.jpeg?sign=fc95655a0964f256fd9f0a44c83de0ce&t=1634460701",
      src: 'https://636c-cloud1-6g9zd57b7c9062bf-1308051702.tcb.qcloud.la/video/end.mp4?sign=227c6dcca74fd5f932052ea4a62e48a8&t=1635641065',
    },
    controls: true,
    showprogress: true,
    loop: true,
    autoplay: true,
    muted: false,
    openId: null,
    userData: {
      userName: null,
      tel: null,
      address: null,
      wechat: null,
      code: null
    },
    contentTel: "17724604801",
    contents: "深圳市罗湖区华丽花园日华阁一楼中通快递"
  },
  onLoad() {
    this.getData();
    this.showValue();
  },
  getData() {
    wx.cloud.callFunction({
      name: "quickstartFunctions",
      data: {
        type: 'getOpenId'
      }
    }).then(res => {
      let openId = res.result.openid;
      this.setData({
        openId: openId
      })
    })
  },

  async showValue() {
    const data = (await db.collection('user').where({
      _openid: this.data.openId
    }).get()).data;

    const userData = data[0];
    if (userData) {
      this.setData({ //将获取的用户数据使用setData赋值给data
        userData: Object.assign(this.data.userData, userData) //将data里原有的userData对象和从数据库里取出来的userData对象合并，避免数据库里的userData为空时，setData会清空data里的userData值
      })
    }
  },

  copyText: function (e) {
    console.log("eeee", e);
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },

  inputSubmit: async function (e) {
    //1.校验数据
    const val = e.detail.value;
    console.log("val", val);
    const { userName, tel, address, wechat, code } = val;
    if (!userName || !tel || !address || !wechat || !code) {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none',
        duration: 1500,
        mask: true,
      });
      return;
    }



    //2.如果改用户已经填写过则修改 否则提交
    if (this.data.userData.userName && this.data.userData.tel && this.data.userData.wechat && this.data.userData.address && this.data.userData.code) {
      //用户已经提交过数据
      wx.showLoading({
        title: '加载中',
      });
      await db.collection('user')
        .where({
          _openid: this.data.openId  //获取用户在集合里的记录，只会有一条记录
        })
        .update({
          data: {
            userName, tel, address, wechat, code
          },
          success: function (res) {
            wx.hideLoading();
            wx.showToast({
              title: '提交成功,请添加客服微信!',
              icon: 'success',
              duration: 2500,
              mask: true,
            })
            wx.switchTab({
              url: '/pages/mine/index',
              success: (result) => {
                
              },
              fail: () => {},
              complete: () => {}
            });
              
          }
        })
    } else {
      //用户第一次提交
      wx.showLoading({
        title: '加载中',
      });
      const result = await db.collection('user').add({
        data: {
          userName, tel, address, wechat, code
        },
        success: function (res) {
          console.log("success", res);
          wx.hideLoading();
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1500,
            mask: true,
          })
        }
      })
    }
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '快递中转转',
      path: '/pages/index'
    }
  }


})
