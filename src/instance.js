/* @flow */
import SendBird, { type SendBirdInstance } from 'sendbird';

export function sendBirdInstance(): SendBirdInstance {
  const sendbird = SendBird.getInstance();
  if (sendbird && 'getConnectionState' in sendbird) {
    const state = sendbird.getConnectionState();
    if (state !== 'OPEN') throw new Error(`Chat is not open WS: ${state}`);
    if (state === 'CLOSED') sendbird.reconnect();
  } else {
    throw new Error('No Sendbird instance');
  }
  return sendbird;
}
