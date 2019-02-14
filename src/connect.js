/* @flow */
import type { User } from 'sendbird';
import { ChatError } from './error';
import { sbGetInstance } from './instance';
import { OPEN } from './constants';

export function sbConnect(userId: string, accessToken: string): Promise<User> {
  const sb = sbGetInstance();
  if (typeof userId === 'string' && typeof accessToken === 'string') {
    return new Promise((resolve, reject) => {
      sb.connect(userId, accessToken, (user, error) => {
        if (error) {
          reject(error);
        } else {
          if (user && user.userId !== userId) throw new ChatError('Can\'t log in', error);
          resolve(user);
        }
      });
    });
  }
  return Promise.reject(
    new ChatError('Invalid arguments', {
      userId,
      accessToken,
    }),
  );
}

export function sbDisconnect(): Promise<void> {
  const sb = sbGetInstance();
  return new Promise((resolve) => {
    if (sb) {
      const state = sb.getConnectionState();
      if (state === OPEN && 'disconnect' in sb) {
        sb.disconnect(() => { resolve(); });
      } else {
        // TODO: Analisis connecting state and disconnect after state open
        resolve();
      }
    } else {
      resolve();
    }
  });
}
