// pages/itemDetail/itemDetail.js
const db = wx.cloud.database()
const _ = db.command
var app = getApp()
const util = require('../../util/util.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemId: '',
    commentTxt: '',
    comments: [],
    isShareTip: false,
    voteFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.isShareTip) {
      this.setData({
        isShareTip: true
      })
    }
    if (options.id) {
      this.setData({
        itemId: options.id
      })
      console.log(options.id)
      this.search(options.id)
    }
  },
  input(e) {
    this.setData({
      commentTxt: e.detail.value
    })
  },
  search(id){
    console.log(id)
    let idNum = 0;
    if (Number(id) || Number(id) == 0)
      idNum = Number(id)
    else
      idNum = this.data.itemId;
    db.collection('message').where({
      id: _.eq(idNum)
    }).get({
      success: res => {
        console.log(res)
        let D = res.data;

        this.setData({
          data: D[0]
        })
      },
      fail: function (e) {
        console.log(e)
      }
    })
  }, 
  submit(){
    let userOpenId = wx.getStorageSync('openId')

    //发送评论
    let d = new Date(), params = {};
    let arr = util.typeC(this.data.data.comment) == 'array' ? this.data.data.comment : new Array(this.data.data.comment);
    if (this.data.commentTxt) {
      params = {
        comment: this.data.commentTxt,
        username: wx.getStorageSync('avatar'),
        time: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
        userId: wx.getStorageSync('userId'),
        id: this.data.itemId,
        avatar: wx.getStorageSync('avatar')
      }
      arr.push(params)

    } else
      wx.showToast({
        title: '请填写内容',
        icon: 'none'
      })
    var cn = this.data.data.comment.length;
    db.collection('comments').add({
      data: {
        id: params.userId,
        userId: params.userId,
        text: params.comment,
        _openid: userOpenId
      },
      success: res => {
        console.log('comment新增成功')
      },
      fail: e => {
        console.log('comment新增失败')
      }
    })

    wx.cloud.callFunction({
      name: 'comment',
      data: {
        comment: arr,
        id: this.data.itemId,
        commentNum: cn
      },
      success: res => {
        wx.showToast({
          title: '评论成功',
        })
        this.search()
        wx.navigateBack({
          //返回
          delta: 1
        })

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '评论失败',
        })
        console.error('[云函数] [comment] 调用失败：', err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})