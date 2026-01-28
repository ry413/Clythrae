var mOnFire = require("other/onfire.js");
var $wxBlufiImpl = require('xBlufi-wx-impl.js');

// 0表示阿里支付宝小程序 1表示微信小程序
export const XMQTT_SYSTEM = {
  Alis: 0,  // 阿里支付宝小程序
  WeChat: 1,// 微信小程序
} as const;
export type XMQTTSystemType = typeof XMQTT_SYSTEM[keyof typeof XMQTT_SYSTEM]

export const XBLUFI_TYPE = {
  TYPE_STATUS_CONNECTED: '-2', /// 设备连接状态回调
  TYPE_CLOSE_CONNECTED: '-1', ///主动关闭连接
  TYPE_CONNECTED: '0',  //主动连接
  TYPE_GET_DEVICE_LISTS: '1', //发现设备列表回调
  TYPE_INIT_ESP32_RESULT: '2',
  TYPE_RECIEVE_CUSTON_DATA: '3', //接收到自定义数据
  TYPE_CONNECT_ROUTER_RESULT: '4',
  TYPE_CONNECT_NEAR_ROUTER_LISTS: '5',
  TYPE_GET_DEVICE_LISTS_START: ' 41', //发现设备列表回调开始
  TYPE_GET_DEVICE_LISTS_STOP: '42', //停止发现设备列表回调
} as const;
export type XBlufiType = typeof XBLUFI_TYPE[keyof typeof XBLUFI_TYPE]

export const OnFireEvent = {
  EVENT_START_DISCONORY: '0', //蓝牙状态事件 发现设备
  EVENT_CONNECT_DISCONNECT: '1', //通知连接或断开蓝牙
  EVENT_NOFITY_INIT_ESP32: '3', //通知获取蓝牙设备的服务uuid列表等初始化工作
  ENENT_ALL: '6',
  EVENT_NOFITY_SEND_ROUTER_SSID_PASSWORD: '50', //通知发送路由器的ssid和password
  EVENT_NOFITY_SEND_CUSTON_DATA: '51', //通知发送自定义数据
  EVENT_NOFITY_SEND_GET_ROUTER_SSID:"52",//获取周围的SSID
} as const;

/**
 * 初始化
 * @param type 参考 XMQTT_SYSTEM
 */
function initXBlufi(type: XMQTTSystemType) {
  switch (type) {
    case XMQTT_SYSTEM.Alis:
      break;
    case XMQTT_SYSTEM.WeChat:
      $wxBlufiImpl.init();
      break;
  }
}

function notifyDeviceMsgEvent(options: any) {
  mOnFire.fire(OnFireEvent.ENENT_ALL, options);
}

function listenDeviceMsgEvent(isSetListener: boolean, funtion: any) {
  if (isSetListener) {
    mOnFire.on(OnFireEvent.ENENT_ALL, funtion)
  } else {
    mOnFire.un(funtion)
  }
}

/**
 * 开始或停止发现附近的蓝牙设备
 * @param options 连接参数 {"isStart":true , "filter":"名字过滤"} :是否开始发现设备
 */
function notifyStartDiscoverBle(options: any) {
  mOnFire.fire(OnFireEvent.EVENT_START_DISCONORY, options);
}

/**
 * 开始或停止发现附近的蓝牙设备
 * @param options 连接参数 {"isStart":true} 是否开始发现设备
 */
function listenStartDiscoverBle(isSetListener: boolean, funtion: any) {
  if (isSetListener) {
    mOnFire.on(OnFireEvent.EVENT_START_DISCONORY, funtion)
  } else {
    mOnFire.un(funtion)
  }
}
/**
 * 连接或断开 蓝牙连接
 *
 * @param options 连接参数 {"connect":true,"deviceID":"设备id，蓝牙发现列表获取"}
 */
function notifyConnectBle(options: any) {
  console.log('notifyConnectBle 蓝牙准备连接的deviceId --------------')
  mOnFire.fire(OnFireEvent.EVENT_CONNECT_DISCONNECT, options);
}
/**
 * 开始或停止连接的蓝牙设备
 * @param options 连接参数 {"isStart":true} 是否开始发现设备
 */
function listenConnectBle(isSetListener: boolean, funtion: any) {
  
  if (isSetListener) {
    mOnFire.on(OnFireEvent.EVENT_CONNECT_DISCONNECT, funtion)
  } else {
    mOnFire.un(funtion)
  }
}

/**
 * 通知初始化获取设备的服务列表等信息
 * @param options 连接参数 {"deviceId":"设备的设备id"} 
 */
function notifyInitBleEsp32(options: any) {
  mOnFire.fire(OnFireEvent.EVENT_NOFITY_INIT_ESP32, options);
}
/**
 * 通知初始化获取设备的服务列表等信息
 * @param options 连接参数 {"isStart":true} 是否开始发现设备
 */
function listenInitBleEsp32(isSetListener: boolean, funtion: any) {
  if (isSetListener) {
    mOnFire.on(OnFireEvent.EVENT_NOFITY_INIT_ESP32, funtion)
  } else {
    mOnFire.un(funtion)
  }
}

/**
 * 获取模组周围的SSID
 * @param options NULL
 */
function notifySendGetNearRouterSsid() {
  mOnFire.fire(OnFireEvent.EVENT_NOFITY_SEND_GET_ROUTER_SSID, null);
}
/**
 * 获取模组周围的SSID
 * @param options 连接参数 {"isStart":true} 是否开始发现设备
 */
function listenSendGetNearRouterSsid(isSetListener: boolean, funtion: any) {
  if (isSetListener) {
    mOnFire.on(OnFireEvent.EVENT_NOFITY_SEND_GET_ROUTER_SSID, funtion)
  } else {
    mOnFire.un(funtion)
  }
}


/**
 * 发送要连接的路由器的ssid和密码
 * @param options 连接参数 {"deviceId":"设备的设备id","serverId":"服务id","characterId":"通道","ssid":"路由器名字","password":"密码"}
 */
function notifySendRouterSsidAndPassword(options: any) {
  mOnFire.fire(OnFireEvent.EVENT_NOFITY_SEND_ROUTER_SSID_PASSWORD, options);
}
/**
 * 发送要连接的路由器的ssid和密码
 * @param options 连接参数 {"isStart":true} 是否开始发现设备
 */
function listenSendRouterSsidAndPassword(isSetListener: boolean, funtion: any) {
  if (isSetListener) {
    mOnFire.on(OnFireEvent.EVENT_NOFITY_SEND_ROUTER_SSID_PASSWORD, funtion)
  } else {
    mOnFire.un(funtion)
  }
}


/**
 * 发送自定义数据
 * @param options 连接参数 {"deviceId":"设备的设备id","serverId":"服务id","characterId":"通道","customData":"自定义数据""}
 */
function notifySendCustomData(options: any) {
  mOnFire.fire(OnFireEvent.EVENT_NOFITY_SEND_CUSTON_DATA, options);
}

/**
 * 发送自定义数据
 * @param options 连接参数 {"deviceId":"设备的设备id","serverId":"服务id","characterId":"通道","customData":"自定义数据""}
 */
function listenSendCustomData(isSetListener: boolean, funtion: any) {
  if (isSetListener) {
    mOnFire.on(OnFireEvent.EVENT_NOFITY_SEND_CUSTON_DATA, funtion)
  } else {
    mOnFire.un(funtion)
  }
}



/****************************** 对外  ***************************************/
export default {
  XMQTT_SYSTEM,
  XBLUFI_TYPE,
  OnFireEvent,

  notifyDeviceMsgEvent,
  listenDeviceMsgEvent,

  notifyStartDiscoverBle,
  listenStartDiscoverBle,

  notifyConnectBle,
  listenConnectBle,

  notifyInitBleEsp32,
  listenInitBleEsp32,

  notifySendRouterSsidAndPassword,
  listenSendRouterSsidAndPassword,

  notifySendCustomData,
  listenSendCustomData,

  notifySendGetNearRouterSsid,
  listenSendGetNearRouterSsid,

  initXBlufi,
};