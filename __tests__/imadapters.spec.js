import * as matchers from 'jest-immutable-matchers';
// import { Set } from 'immutable';
import groupChannel from '../__mock__/groupChannelList.json';
import userMessage from '../__mock__/userMessage.json';
import {
  documentName,
} from '../__mock__/channelName';
import {
  channelsToThreads,
  messageReceiveFactory,
} from '../src/im/adapters';
import {
  chatStateFactory,
  receiveMessageMergeTpState,
} from '../src/im/helpers';

describe('Immutamle Adapters', () => {
  it('Should transform groupChannels to store data', () => {
    const threads = channelsToThreads('local', groupChannel);
    const documentThread = threads.get(documentName);
    expect(documentThread.name).toEqual(documentName);
    expect(documentThread.url).toBeString();
    expect(true).toBeTruthy();
  });

  it('Should transform data receive from message handler to store data', () => {
    const receiver = messageReceiveFactory('local');
    const channel = groupChannel[0];
    const res = receiver(channel, [userMessage]);
    expect(res.messages.size).toBe(1);
    const m = res.messages.add(res.messages.first());
    expect(m.size).toBe(1);
    expect(res.messages.first().message).toEqual(userMessage.message);
    expect(res.messages.first().messageId).toEqual(userMessage.messageId);
    expect(res.messages.first().sender.userId).toEqual(userMessage.sender.userId);
  });
});

describe('Immutable reducers', () => {
  const state = chatStateFactory();
  const receiver = messageReceiveFactory('local');
  const channel = groupChannel[0];
  const threadWithOneMessage = receiver(channel, [userMessage]);
  beforeEach(() => {
    jest.addMatchers(matchers);
  });

  it('Should merge thread received massage to empty store', () => {
    const nextState = receiveMessageMergeTpState(state, threadWithOneMessage);
    expect(nextState.threads).toBeImmutableMap();
    expect(nextState.threads.get(channel.name).messages).toBeImmutableSet();
    expect(nextState.threads.get(channel.name)).toEqualImmutable(threadWithOneMessage);
  });

  it('Should merge thread received massage to exist thread in store', () => {
    const stateWithOneThreadWithOneMessage = receiveMessageMergeTpState(state, threadWithOneMessage);
    const firstMessage = threadWithOneMessage.get('messages').first();
    const nextMessage = firstMessage.update('messageId', u => u + 1);
    const threadWithNextMessage = threadWithOneMessage.set('messages', nextMessage);
    const nextState = receiveMessageMergeTpState(stateWithOneThreadWithOneMessage, threadWithNextMessage);
    // expect(nextState.threads.get(channel.name).messages).toEqualImmutable(Set([firstMessage, nextMessage]));
  });
});
