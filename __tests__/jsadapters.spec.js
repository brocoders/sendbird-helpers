/* @flow */
import groupChannel from '../__mock__/groupChannelList.json';
import userMessage from '../__mock__/userMessage.json';
import {
  documentName,
  generalName,
} from '../__mock__/channelName';
import {
  channelsToThreads,
  messageReceiveFactory,
} from '../src/jsAdapters';

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
    const threads = channelsToThreads('staging', groupChannel);
    expect(threads).toBeObject();
    const generalThread = threads[generalName];
    expect(generalThread.name).toEqual(generalName);
    expect(generalThread.url).toBeString();
    // $FlowFixMe
    expect(generalThread.documentId).toBeUndefined();
  });

  it('Should transform data receive from message handler to store data', () => {
    const receiver = messageReceiveFactory('local');
    const channel = groupChannel[0];
    const res = receiver(channel, userMessage);
    expect(res.messages.length).toBe(1);
    expect(res.messages[0].message).toEqual(userMessage.message);
    expect(res.messages[0].messageId).toEqual(userMessage.messageId);
    expect(res.messages[0].sender.userId).toEqual(userMessage.sender.userId);
  });
});
