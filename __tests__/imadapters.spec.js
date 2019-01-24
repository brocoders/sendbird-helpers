/* @flow */
import groupChannel from '../__mock__/groupChannelList.json';
import { channelsToThreads } from '../src/imAdapters';

describe('Immutamle Adapters', () => {
  it('', () => {
    const thread = channelsToThreads('local', groupChannel);
    // console.log(JSON.stringify(thread, null, 2), '>>');
    expect(true).toBeTruthy();
  });
});
