/* @flow */
import keys from '../__mock__/keys';
import { sbCreatInstance, sbGetInstance } from '../src/instance';
import { sbConnect, sbDisconnect } from '../src/connect';
import { sbChannelList } from '../src/groupChannel';
import { channelsToThreads } from '../src/imAdapters';

const fs = require('fs');


describe('Group Channel', () => {

  beforeAll((done) => {
    sbCreatInstance(keys.apiKey);
    return sbConnect(keys.userId, keys.accessToken).then(() => { done(); })
  });

  afterAll((done) => {
    return sbDisconnect().then(() => { done(); });
  })

  it('Should get channel list', () => {
    expect(sbGetInstance().getConnectionState()).toEqual('OPEN')
    return sbChannelList()
      .then(cl => {
        expect(Array.isArray(cl)).toBeTruthy();
      });
  });
});