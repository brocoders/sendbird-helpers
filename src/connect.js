/* @flow */
import SendBird, {
  type GroupChannel,
  type User,
} from 'sendbird';

export function connect(appId: string, userId: ?string, accessToken: ?string): Promise<User> {
  const sendbird = new SendBird({ appId, newInstance: true });
  if (sendbird && 'connect' in sendbird && userId && accessToken) {
    return new Promise((resolve, reject) => {
      sendbird.connect(userId, accessToken, (user, error) => {
        if (error) {
          reject(error);
        } else {
          if (user && user.userId !== userId) throw new Error('Can\'t loged in');
          resolve(user);
        }
      });
    });
  }
  return Promise.reject(new Error(`Invalid arguments userId-${JSON.stringify(userId)} accessToken-${JSON.stringify(accessToken)}`));
}
