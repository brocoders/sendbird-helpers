/* @flow */
import keys from '../__mock__/keys';
import { sbConnect, sbDisconnect } from '../src/connect';
import { sbCreatInstance } from '../src/instance';

// jest.mock('sendbird', () => {
//   return sbMock;
// });

describe('Connect to SendBird', () => {
  it('Should be connected', () => {
    sbCreatInstance(keys.apiKey);
    return sbConnect(keys.userId, keys.accessToken)
      .then(user => {
        expect(user.userId).toEqual(keys.userId);
        sbDisconnect();
      })
  });
});
