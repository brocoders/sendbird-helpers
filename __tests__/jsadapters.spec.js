/* @flow */
import groupChannel from '../__mock__/groupChannelList.json';
import { channelsToThreads } from '../src/jsAdapters';

const documentName = 'local#a1ae760ff7#e9ff6bcb686c4ca7c2350bed5bc6346f.pdf#a.golovchuk@brocoders.com#arikfishb@gmail.com';
const generalName = 'staging#ed70da07f4#a.golovchuk@brocoders.com#account1@dokka.biz';
const unCnownName = 'undefined#ed70da07f4#a.golovchuk@brocoders.com#account1@dokka.biz';

describe('JS Adapters', () => {
  it('Document adapter', () => {
    const threads = channelsToThreads('local', groupChannel);
    expect(threads).toBeObject();
    const documentThread = threads[documentName];
    expect(documentThread.name).toEqual(documentName);
    expect(documentThread.url).toBeString();
    // $FlowFixMe
    expect(documentThread.documentId).toBeString();
  });

  it('Document adapter', () => {
    const threads = channelsToThreads('local', groupChannel);
    expect(threads).toBeObject();
    const generalThread = threads[generalName];
    expect(generalThread.name).toEqual(generalName);
    expect(generalThread.url).toBeString();
    // $FlowFixMe
    expect(generalThread.documentId).toBeUndefined();
  });
});
