/* @flow */
import keys from '../__mock__/keys';
import { sbCreatInstance } from '../src/instance';

describe('SendBird instance', () => {
  it('Should be created instance', () => {
    const sb = sbCreatInstance(keys.apiKey);
    expect(sb.getConnectionState()).toEqual('CLOSED');
  });
});
