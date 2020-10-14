/**
* by lianbo.guo
 * @Description 错误状态预留码
 * 0 - 999 通用类型错误码
 *
 * 每千位错误类型中
 * 0 - 400位通用错误
 * 401 - 700 位为2D场景相关专有错误
 * 701 - 1000 位为3D场景相关专有错误
 *
 * 1000 - 1999 level相关
 * 2000 - 2999 room相关
 * 3000 - 3999 wall相关
 * 4000 - 4999 light相关
 * 5000 - 5999 celling相关
 * 6000 - 6999 group相关
 * 7000 - 7999 corner相关
 * 8000 - 8999 hole相关
 * 9000 - 11000 全局其他错误
 * ... 其他相关错误请补充并添加注释
 */

const ErrorStatus = {
  CREATE_LEVEL_ERROR: 1001, // 创建楼层错误

  CREATE_WALL_ERROR: 3001, // 创建墙体错误
  CREATE_ROOM_ERROR: 2001, // 创建房间错误
  CREATE_ROOM_INSIDE_ROOM_ERROR: 2002, // 在房间内创建房间

  SYSTEM: 2, // 系统异常
  ILLEGAL: 1, // 普通异常

  SAVE_HOME_WARN: 402, // 保存户型错误

  CEILING_GROUP: 5001, // 禁止组合天花模型

  MIX_GROUP: 6001, // 禁止混合组合

  HOLE_REPLACE_ERROR: 8001, // 替换门窗错误
  HOLE_REPLACE_NO_WIN: 8002, // 没有门窗

  EMPTY_SAMPLE_ROOM_ERROR: 9000, // 空样板间错误
};

export default ErrorStatus;
