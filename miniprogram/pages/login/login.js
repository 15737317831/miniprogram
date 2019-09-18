// pages/login/login.js
let db = wx.cloud.database()
let userdb = db.collection("userInfo")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: "未登录",
    avatarUrl: '../index/user-unlogin.png',
    isLogin: false, //用户是否已经登录
    allow: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.cloud.callFunction({
      name: "login",
      success: res => {
        wx.setStorage({
          key: 'openid',
          data: res.result.openid,
        },)
        // 后台验证
        if (res.result.allow) {
          wx.setStorage({
            key: 'allow',
            data: true,
          })
          this.setData({
            allow: true
          })
        }
      },

    })
  // 用户授权信息后才能获取
    wx.getUserInfo({
      success: res => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
          isLogin: true
        })
      }
    })
  },
  getUserInfo: function(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName,
        isLogin: true
      })
    }
  },
  // 跳转
  jump() {
    if (!this.data.allow) {
      wx.showToast({
        title: '抱歉,你没有权限登录',
      })
    } else {
      // 登录后跳转到主页
      var userId = wx.getStorageSync('userId')
      if (!userId) {
        userId = this.getUserId()
      }
      let data = {
        openid: wx.getStorageSync("openid"),
        nickName: this.data.nickName,
        avatarUrl: this.data.avatarUrl,
        userId: userId,
      }
      var avatar = this.data.nickName     
      wx.setStorageSync("avatar", avatar)
      //添加数据到数据库,查询是否存在
      userdb.where({
        openid: data.openid
      }).get().then(res=>{
        // 判断是否是新用户,没有就添加有就直接跳转
        if(res.data.length === 0){
          userdb.add({data:data}).then(res=>{
            wx.showToast({
              title: '新用户添加成功',
            })
          })
        }
      })
      wx.navigateTo({
        url: '/pages/message/message',
      })
    }
  },
  getUserId: function () {
    var w = "abcdefghijklmnopqrstuvwxyz0123456789",
      firstW = w[parseInt(Math.random() * (w.length))];

    var userId = firstW + (Date.now()) + (Math.random() * 100000).toFixed(0)
    console.log(userId)
    wx.setStorageSync("userId", userId)

    return userId;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})