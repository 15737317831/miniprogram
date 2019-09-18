// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()



// 云函数入口函数
exports.main = async (event, context) => {

  var comment = event.comment, id = event.id,
    commentNum = event.commentNum;
  console.log('云函数comment成功', comment, id)

  // console.warn(data)

  try {
    return await db.collection('message').where({
      id: Number(id)
    }).update({
      data: {
        comment: comment,
        commentNum: commentNum
      },
      success: res => {
        console.log('云函数comment成功', comment, id)

      },
      fail: e => {
        console.error(e)
      }
    })
  } catch (e) {
    console.error(e)
  }

}