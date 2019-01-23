/* @flow */
import SendBird, { type SendBirdInstance } from 'sendbird';
import { ChatError } from './error';

export function sbCreatInstance(appId: string, newInstance?: boolean = true) {
  return new SendBird({ appId, newInstance });
}

export function sbGetInstance(): SendBirdInstance {
  return SendBird.getInstance();
}

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
