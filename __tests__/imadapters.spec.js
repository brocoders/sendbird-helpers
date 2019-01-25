import groupChannel from '../__mock__/groupChannelList.json';
import userMessage from '../__mock__/userMessage.json';
import {
  documentName,
} from '../__mock__/channelName';
import {
  channelsToThreads,
  messageReciveFactory,
} from '../src/imAdapters';

describe('Immutamle Adapters', () => {
  it('Should transform groupChannels to store data', () => {
    const threads = channelsToThreads('local', groupChannel);
    const documentThread = threads.get(documentName);
    expect(documentThread.name).toEqual(documentName);
    expect(documentThread.url).toBeString();
    expect(true).toBeTruthy();
  });

  it('Should transform data recive from message handler to store data', () => {
    const reciver = messageReciveFactory('local');
    const channel = groupChannel[0];
    const res = reciver(channel, userMessage);
    expect(res.messages.size).toBe(1);
    expect(res.messages.get(0).message).toEqual(userMessage.message);
    expect(res.messages.get(0).messageId).toEqual(userMessage.messageId);
    expect(res.messages.get(0).sender.userId).toEqual(userMessage.sender.userId);
  });
});
