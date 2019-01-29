/* @flow */
import SendBird, { type SendBirdInstance } from 'sendbird';
import { ChatError } from './error';

export function sbCreatInstance(appId: string, newInstance?: boolean = true): SendBirdInstance {
  return new SendBird({ appId, newInstance });
}

export function sbGetInstance(): SendBirdInstance {
  return SendBird.getInstance();
}

// export function sbGetPromisedInstance(): Promise<SendBirdInstance> {
//   const instance = SendBird.getInstance();
//   const state = instance.getConnectionState();
//   if (state === 'CONNECTING') {
//     return new Promise((resolve, reject) => {
//       const cHandler: ConnectionHandler = new instance.ConnectionHandler();
//       cHandler.onReconnectSucceeded = () => {
//         resolve(instance);
//       };
//       cHandler.onReconnectFailed = () => {
//         reject();
//       };
//       instance.addConnectionHandler('id', cHandler);
//     });
//   }
//   if (state === 'OPEN') return Promise.resolve(instance);
//   return Promise.reject();
// }

export function sbGetConnectedInstance(): SendBirdInstance {
  const sendbird = sbGetInstance();
  if (sendbird && 'getConnectionState' in sendbird) {
    const state = sendbird.getConnectionState();
    if (state !== 'OPEN') throw new ChatError('Is not open WS', state);
    if (state === 'CLOSED') sendbird.reconnect();
  } else {
    throw new ChatError('No Sendbird instance');
  }
  return sendbird;
}
