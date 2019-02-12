/* @flow */
import {
  documentName,
  generalName,
  unCnownName,
} from '../__mock__/channelName';
import { getParamsFromChannelNameWithEnv } from '../src/adapters';

describe('Adapters', () => {
  it('Should return Document params', () => {
    expect(getParamsFromChannelNameWithEnv('local', documentName)).toEqual({
      env: 'local',
      companyId: 'a1ae760ff7',
      documentId: 'e9ff6bcb686c4ca7c2350bed5bc6346f.pdf',
      users: [
        'admin@example.com',
        'user1@example.gov',
      ],
    });
  });

  it('Should return General params', () => {
    expect(getParamsFromChannelNameWithEnv('staging', generalName)).toEqual({
      env: 'staging',
      companyId: 'ed70da07f4',
      users: [
        'account1@example.biz',
        'user1@example.gov',
      ],
    });
  });

  it('Should return NULL in uncnown env', () => {
    expect(getParamsFromChannelNameWithEnv('local', unCnownName)).toBeNull();
  });
});
