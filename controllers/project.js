const loadModel = require('../db')
const playerModel = loadModel('player')
const singleModel = loadModel('singleplayer')
const multiModel = loadModel('multiplayer')

// 建立singleplayer、multiplayer和player表的关联
// playerModel.hasMany(singleModel, {foreignKey: 'pid', targetKey: 'pid'})
// playerModel.hasMany(multiModel, {foreignKey: 'pid', targetKey: 'pid'})
singleModel.belongsTo(playerModel, {foreignKey: 'pid', targetKey: 'pid'})
multiModel.belongsTo(playerModel, {foreignKey: 'pid', targetKey: 'pid'})

const queryProjectList = async (ctx, next) => {
  let res
  // 获取参数
  const { uid, type } = ctx.query
  // 判断参数合法性
  if (!uid || !type) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      msg: '参数错误，请重试！'
    }
    return
  }
  // 获取该用户参与的项目
  let projectData
  try {
    if (~~type === 0) {
      projectData = await singleModel.findAll({
        include: [{
          model: playerModel,
          attributes: [],
          where: {
            uid,
            type
          }
        }]
      })
    } else {
      projectData = await multiModel.findAll({
        include: [{
          model: playerModel,
          attributes: [],
          where: {
            uid,
            type
          }
        }]
      })
    }
    ctx.status = 200
    res = {
      code: 0,
      msg: '查询成功！',
      data: projectData
    }
  } catch (e) {
    ctx.status = 500
    res = {
      code: 500,
      msg: '查询失败！',
      err: e.message
    }
  }
  ctx.body = res
}

const createMultiProject = async (ctx, next) => {
  let res
  const { uid, name, avatar, nickname, type, rank } = ctx.request.body
  if (!uid || !name || !avatar || !nickname || !type || !rank) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      msg: '参数错误，请重试！'
    }
    return
  }
  try {
    const isNameDuplicated = await multiModel.findOne({
      where: {
        name
      }
    })
    if (isNameDuplicated) {
      ctx.status = 400
      ctx.body = {
        code: 400,
        msg: '项目名称重复！'
      }
      return
    } else {
      await multiModel.create({
        uid,
        name,
        avatar,
        nickname,
        type,
        rank
      })
      ctx.status = 200
      res = {
        code: 0,
        msg: '创建成功！'
      }
    }
  } catch (e) {
    console.log(e)
    ctx.status = 500
    res = {
      code: 500,
      msg: '创建失败！',
      err: e.message
    }
  }
  ctx.body = res
}

module.exports = {
  queryProjectList,
  createMultiProject
}
