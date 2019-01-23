/* @flow */
import keys from '../__mock__/keys';
import { sbCreatInstance } from '../src/instance';
import { sbConnect, sbDisconnect } from '../src/connect';
import { channelList } from '../src/groupChannel';

describe('Group Channel', () => {

  beforeAll((done) => {
    sbCreatInstance(keys.apiKey);
    return sbConnect(keys.userId, keys.accessToken)
      .then(() => {
        done();
      })
  });

  afterAll((done) => {
    return sbDisconnect()
      .then(() => {
        done();
      });
  })

  it('Should get channel list', () => {
    return channelList()
      .then(cl => {
        expect(Array.isArray(cl)).toBeTruthy();
      });
  });
});