/* @flow */
import { getParamsFromChannelName, getThreadFromChannelFactory } from '../src/adapters';

describe('Adapters', () => {

  const documentName = 'local#a1ae760ff7#e9ff6bcb686c4ca7c2350bed5bc6346f.pdf#a.golovchuk@brocoders.com#arikfishb@gmail.com';
  const generalName = 'staging#ed70da07f4#a.golovchuk@brocoders.com#account1@dokka.biz';
  const unCnownName = 'undefined#ed70da07f4#a.golovchuk@brocoders.com#account1@dokka.biz';

  it('Should return Document params', () => {
    expect(getParamsFromChannelName(documentName)).toEqual({
      env: 'local',
      companyId: 'a1ae760ff7',
      documentId: 'e9ff6bcb686c4ca7c2350bed5bc6346f.pdf',
      users: [
        'a.golovchuk@brocoders.com',
        'arikfishb@gmail.com',
      ]
    });
  });

  it('Should return General params', () => {
    expect(getParamsFromChannelName(generalName)).toEqual({
      env: 'staging',
      companyId: 'ed70da07f4',
      users: [
        'a.golovchuk@brocoders.com',
        'account1@dokka.biz',
      ]
    });
  });

  it('Should return NULL in uncnown env', () => {
    expect(getParamsFromChannelName(unCnownName)).toBeNull();
  });

});
