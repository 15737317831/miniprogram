// pages/publish/publish.js
const db = wx.cloud.database()
const messagedb = db.collection("message")
const sourceType = [['camera'], ['album'], ['camera', 'album']]
const sizeType = [['compressed'], ['original'], ['compressed', 'original']]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    piclist: [],
    content: '',
    sourceTypeIndex: 2,
    sourceType: ['拍照', '相册', '拍照或相册'],
    sizeTypeIndex: 2,
    sizeType: ['压缩', '原图', '压缩或原图'],
    countIndex: 8,
    count: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    shareNum:0,
    comment: [],
    commentNum:0,
    index:0,
    vote:0
  },
  //上传图片
  uploadpic() {
    const that = this
    wx.chooseImage({
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      count: this.data.count[this.data.countIndex],
      success: res => {
        this.setData({
          piclist: res.tempFilePaths
        })
      },
    })
  },
  previewImage(e) {
    const current = e.target.dataset.src
    wx.previewImage({
      current,
      urls: this.data.piclist
    })
  },
  input(e) {
    this.data.content = e.detail.value
  },
  publish() {
    //上传图片得到图片的fileid
    let promiseList = []
    this.data.piclist.forEach(item => {
      const suffix = item.match(/\.[^\.]+$/g)[0]
      promiseList.push(new Promise((res, rej) => {
        wx.cloud.uploadFile({
          filePath: item,
          cloudPath: "images/" + Math.floor(Math.random() * 1000) + new Date().valueOf() + suffix,
          success: res
        })
      }))
    })
    Promise.all(promiseList).then(list => {
        let data = {}
        data.userId =  wx.getStorageSync('userId'),
        data.openid = wx.getStorageSync('openid')
        data.id = Number(this.data.index) + 1,
        data.content = this.data.content
        data.shareNum = this.data.shareNum
        data.commentNum = this.data.commentNum
        data.vote = this.data.vote
        data.comment = this.data.comment,
        data.time = new Date(+new Date(new Date().toJSON()) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
        data.fileList = list.map(i => i.fileID)
        messagedb.add({
          data: data,
          success: () => {
            wx.showToast({
              title: '发表状态成功',
            })
            wx.navigateTo({
              url: '/pages/message/message',
            })
          }
        })
      }

    )
  },
  getCount: function () {
    var that = this
    db.collection('message').count({
      success: res => {
        that.setData({
          index: Number(res.total)
        })
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCount()
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