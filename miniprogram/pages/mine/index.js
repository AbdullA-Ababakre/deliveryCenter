//index.js
const app = getApp()
const { envList } = require('../../envList.js')

const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    imgSrc: "https://636c-cloud1-6g9zd57b7c9062bf-1308051702.tcb.qcloud.la/image/qrcode.png?sign=a7209f685d804d9c2811b66ab083d685&t=1635641230"
  },
  previewImage(){
    wx.previewImage({
      current: this.data.imgSrc, // 当前显示图片的http链接
      urls: ["https://636c-cloud1-6g9zd57b7c9062bf-1308051702.tcb.qcloud.la/image/qrcode.png?sign=a7209f685d804d9c2811b66ab083d685&t=1635641230"] // 需要预览的图片http链接列表
    })
  },
  saveImage() {
    let url = this.data.imgSrc;
    wx.downloadFile({
      url: url,
      success: function (res) {
        var benUrl = res.tempFilePath;
        //图片保存到本地相册
        wx.saveImageToPhotosAlbum({
          filePath: benUrl,
          //授权成功，保存图片
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          //授权失败
          fail: function (err) {
            if (err.errMsg) {//重新授权弹框确认
              wx.showModal({
                title: '提示',
                content: '您好,请先授权，在保存此图片。',
                showCancel: false,
                success(res) {
                  if (res.confirm) {//重新授权弹框用户点击了确定
                    wx.openSetting({//进入小程序授权设置页面
                      success(settingdata) {
                        console.log(settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {//用户打开了保存图片授权开关
                          wx.saveImageToPhotosAlbum({
                            filePath: benUrl,
                            success: function (data) {
                              wx.showToast({
                                title: '保存成功',
                                icon: 'success',
                                duration: 2000
                              })
                            },
                          })
                        } else {//用户未打开保存图片到相册的授权开关
                          wx.showModal({
                            title: '温馨提示',
                            content: '授权失败，请稍后重新获取',
                            showCancel: false,
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '快递中转转',
      path: '/pages/mine/'
    }
  }
})
