// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()



// 云函数入口函数
exports.main = async (event, context) => {

  var id = event.id, validStatus = event.validStatus, validTime = event.validTime;
  console.log('云函数passItem成功', id)

  // console.warn(data)

  try {
    return await db.collection('message').where({
      id: Number(id)
    }).update({
      data: {
        validStatus: 0,
        validTime: validTime,
        validStatus: validStatus
      },
      success: res => {
        console.log('云函数passItem成功', id)

      },
      fail: e => {
        console.error(e)
      }
    })
  } catch (e) {
    console.error(e)
  }

}

