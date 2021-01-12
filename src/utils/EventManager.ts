import EventEmitter from 'eventemitter3';

class EventManager extends EventEmitter {}

export const EventMgr = new EventManager();

export const EventEnum = {
  selectNode: Symbol(),
  initHome: Symbol(),
  layerAdd: Symbol(),
  layerRemove: Symbol(),
};
