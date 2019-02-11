/* @flow */
import {
  documentName,
  generalName,
  unCnownName,
} from '../__mock__/channelName';
import { getParamsFromChannelName } from '../src/adapters';

describe('Adapters', () => {
  it('Should return Document params', () => {
    expect(getParamsFromChannelName('local', documentName)).toEqual({
      env: 'local',
      companyId: 'a1ae760ff7',
      documentId: 'e9ff6bcb686c4ca7c2350bed5bc6346f.pdf',
      users: [
        'user1@example.gov',
        'admin@example.com',
      ],
    });
  });

  it('Should return General params', () => {
    expect(getParamsFromChannelName('staging', generalName)).toEqual({
      env: 'staging',
      companyId: 'ed70da07f4',
      users: [
        'user1@example.gov',
        'account1@example.biz',
      ],
    });
  });

  it('Should return NULL in uncnown env', () => {
    expect(getParamsFromChannelName('local', unCnownName)).toBeNull();
  });
});
