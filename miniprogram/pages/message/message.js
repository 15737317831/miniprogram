// pages/message/message.js
const app = getApp()
const db = wx.cloud.database()
const message = db.collection("message")
const userdb = db.collection("userInfo")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messageList: [],
    avatarUrl: '',
    newsList: [],
    iszan: [],
    defaultImg: '../../images/tx.png',
    datas: [],
    zanIcon: '../../images/zan.png',
    zanIcon1: '../../images/zan1.png',
    pageId: 0,
    imgHeight: 225,
    lazy_load: false,
    voteArr: [],
    qiuId: '',
    userInfo: {}, // 存放用户信息
    resultData: [], // 存放数据
    userStatus: {}, // 存放地理位置
    scrolltop: 20, // 滚动轴TOP
    page: 1, // 页码值
    cz_flag: false, // 控制点赞评论按钮
    cz_right: 0, // 点赞评论定位right
    cz_top: 80, // 点赞评论定位top
    dz_id: null, // 点赞评论ID
    animationData: {},
    animationData1: {}, // 发布按钮下滑动画
    animationData2: {} // 位置按钮下滑动画
  },

  publish() {
    wx.navigateTo({
      url: '/pages/publish/publish',
    })
  },
  previewImage(e) {
    let list = this.data.datas
    let fileList = []
    const current = e.target.dataset.src
    if (list.length != 0) {
      list.forEach(item => {
        if (item.fileList.length != 0) {
          item.fileList.forEach(ele => {
            if (current == ele) {
              fileList.push(ele)
            }
          })
        }
      })
    }
    wx.previewImage({
      current,
      urls: fileList
    })
  },
  /**

   * 下拉刷新

     */
    loading(){
      wx.startPullDownRefresh()

      wx.showToast({

        title: 'loading....',

        icon: 'loading'

      })
    },
 
  
  onPullDownRefresh: function () {
   
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    this.loading()
    var page = wx.getStorageSync('page')
    // 查询第一页
    that.search(that.data.pageId)
    setTimeout(function () {
      
       wx.hideNavigationBarLoading() //完成停止加载

      wx.stopPullDownRefresh() //停止下拉刷新

    }, 500);
  },



  /**

   * 加载更多

   */

  onReachBottom: function() {

    // console.log('onReachBottom')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    wx.getUserInfo({
      success: res => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
        })
      }
    })
    var that = this;

    var page = wx.getStorageSync('page')
    // 查询第一页
    that.search(that.data.pageId)
  },
  setPage: function(page) {
    wx.setStorageSync('page', page)

  },
  getPage: function() {
    return wx.getStorageSync('page')
  },
  zan: function(e) {
    var arr = this.data.voteArr;
    
    var id = Number(e.currentTarget.dataset.index),
      D = this.data.datas;
    let isvote = D[id].userId == wx.getStorageSync('userId') && D[id].vote != 0
    if (arr.indexOf(D[id].id) != -1 && D[id].userId == wx.getStorageSync('userId') || D[id].vote != 0) {
      D[id].vote -= 1;
      arr.splice(arr.indexOf(D[id].id), 1)
      let data = {
        vote: Number(D[id].vote),
        id: D[id].id,
        userId: wx.getStorageSync('userId'),
      }
      wx.cloud.callFunction({
        name: 'zan',
        data: {
          vote: Number(D[id].vote),
          id: D[id].id,
        },
        success: res => {
          wx.showToast({
            title: '取消点赞成功',
          })
          D[id].zanUrl = this.data.zanIcon
          this.setData({
            datas: D
          })

        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '点赞失败',
          })
          console.error('[云函数] [zan] 调用失败：', err)
        }
      })
      this.setData({
        datas: D,
        voteArr: arr
      })
    } else{
      arr.push(D[id].id)
      this.setData({
        voteArr: arr
      })
      if (id ||id == 0) {
        D[id].zanUrl = this.data.zanIcon1
        D[id].vote = Number(D[id].vote) + 1
      }
      let data = {
        vote: isvote ? Number(D[id].vote) - 1: Number(D[id].vote) + 1,
        id: D[id].id,
        userId: wx.getStorageSync('userId'),
      }
      wx.cloud.callFunction({
        name: 'zan',
        data: {
          vote: Number(D[id].vote),
          id: D[id].id,
        },
        success: res => {
          wx.showToast({
            title: '点赞成功',
          })
          this.setData({
            datas: D
          })

        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '点赞失败',
          })
          console.error('[云函数] [zan] 调用失败：', err)
        }
      })
    }

  },
  //page: 页数
  search: function(page) {
    const db = wx.cloud.database()
    const _ = db.command;
    var that = this;
    var userId = wx.getStorageSync('userId')
    if (!page) {
      page = this.getPage()

    }
    //设置页码
    this.setPage(page);
    db.collection('message').where({
      id: _.lt((page + 1) * 20).and(_.gt(page * 20)),
      validStatus: _.neq(0)
    }).get({
      success: res => {
        wx.hideLoading()
        res.data.map(item => {
          if (item.userId == wx.getStorageSync('userId') && item.vote!=0){
            item.zanUrl = that.data.zanIcon1
          }else{
            item.zanUrl = that.data.zanIcon
          }
          userdb.where({
            openid: item.openid
          }).get().then(resp => {
            item.userInfo = resp.data[0]
            this.setData({
              datas: res.data.sort((a, b) => {
             return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
              })
            })
          })
        })

        // var D = res.data.sort((a, b) => {
        //   return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
        // });
        // D.forEach(function (item, i) {
        //   console.log(item)
        //   D[i].zanUrl = that.data.zanIcon
        //   userdb.where({
        //     openid: item.openid
        //   }).get().then(resp => {
        //     item.userInfo = resp.data[0]
        //   })
        // })
        // if (D.userInfo){
        //   that.setData({
        //     datas: D
        //  })
        // }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  refresh: function() {
    var page = this.getPage()
    // wx.startPullDownRefresh()
    this.search(Number(page) + 1)
    wx.showLoading({
      title: '加载中...',
    })
  },
  onPullDownRefresh: function() {
    var page = this.getPage()
    // wx.startPullDownRefresh()
    this.search(Number(page) + 1)
  },
  onShareAppMessage: function(res) {
    if (res.from === "button") {
      wx.cloud.callFunction({
        name: 'shareHandler',
        data: {
          id: res.target.dataset.qiuid,
          shareNum: Number(res.target.dataset.sharenum) + 1
        },
        success: e => {
          wx.showToast({
            title: '分享成功',
          })
          this.search(this.data.pageId)
          console.log(e)
        },
        fail: e => {
          console.log(e)
        }
      })
      return {
        title: "我发现了一个好笑的东西,分享给你 --糗皮虎",
        path: '/pages/itemDetail/itemDetail?id=' + res.target.dataset.qiuid + '&isShareTip=1',
        imageUrl: ''
      }

    }
  },
  onReachBottom: function() {
    setTimeout(() => {
      this.refresh()

    }, 500)
  },
  nav2Detail: function(e) {
    wx.navigateTo({
      url: '../itemDetail/itemDetail?id=' + e.currentTarget.dataset.id,
    })
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
    var that = this;

    var page = wx.getStorageSync('page')
    // 查询第一页
    that.search(that.data.pageId)
    // var that = this;

    // var page = wx.getStorageSync('page')
    // // 查询第一页
    // that.search(that.data.pageId)
    // 获取message
    // message.where({}).get().then(res => {
    //   res.data.map(item => {
    //     userdb.where({
    //       openid: item.openid
    //     }).get().then(resp => {
    //       item.userInfo = resp.data[0]
    //       this.setData({
    //         messageList: res.data.sort((a, b) => {
    //           return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
    //         })

    //       })
    //       console.log(this.data.messageList)
    //     })
    //   })

    // })
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