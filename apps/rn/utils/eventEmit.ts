import EventEmitter from 'events';

export const eventEmit = new EventEmitter();

eventEmit.setMaxListeners(100);
