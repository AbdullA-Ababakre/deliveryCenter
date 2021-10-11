//index.js
const app = getApp()
const { envList } = require('../../envList.js')

const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    video: {
      poster: "https://tcb-1251009918.cos.ap-guangzhou.myqcloud.com/demo/video.png",
      src: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
    },
    controls: true,
    showprogress: true,
    loop: true,
    autoplay: false,
    muted: false,
    openId: null,
    userData: {
      userName: null,
      tel: null,
      address: null,
      wechat: null,
    },
    contents: "深圳市南山区粤海大厦A座1903"
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
    // debugger;
    const val = e.detail.value;
    const { userName, tel, address, wechat } = val;
    if (!userName || !tel || !address || !wechat) {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none',
        duration: 1500,
        mask: true,
      });
      return;
    }


    //1.校验数据
    //2.如果改用户已经填写过则修改 否则提交
    if (this.data.userData.userName && this.data.userData.tel && this.data.userData.wechat && this.data.userData.address ) {
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
            userName, tel, address, wechat
          },
          success: function (res) {
            wx.hideLoading();
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1500,
              mask: true,
            })
          }
        })
    } else {
      //用户第一次提交
      wx.showLoading({
        title: '加载中',
      });
      console.log("第一次提交",userName, tel, address, wechat);
      const result = await db.collection('user').add({
        data: {
          userName, tel, address, wechat
        },
        success: function (res) {
          console.log("success",res);
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







    console.log('提交的数据信息:', e.detail.value)
  },
})
