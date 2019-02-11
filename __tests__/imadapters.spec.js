import * as matchers from 'jest-immutable-matchers';
import { Set } from 'immutable';
import groupChannel from '../__mock__/groupChannelList.json';
import userMessage from '../__mock__/userMessage.json';
import {
  documentName,
} from '../__mock__/channelName';
import {
  channelsToThreads,
  messageReciveFactory,
} from '../src/im/adapters';
import {
  chatStateFactory,
  reciveMessageMergeTpState,
} from '../src/im/helpers';

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
    const m = res.messages.add(res.messages.first());
    expect(m.size).toBe(1);
    expect(res.messages.first().message).toEqual(userMessage.message);
    expect(res.messages.first().messageId).toEqual(userMessage.messageId);
    expect(res.messages.first().sender.userId).toEqual(userMessage.sender.userId);
  });
});

describe('Immutable reducers', () => {
  const state = chatStateFactory();
  const reciver = messageReciveFactory('local');
  const channel = groupChannel[0];
  const threadWithOneMessage = reciver(channel, userMessage);
  beforeEach(() => {
    jest.addMatchers(matchers);
  });

  it('Should merge thread recived massage to empty store', () => {
    const nextState = reciveMessageMergeTpState(state, threadWithOneMessage);
    expect(nextState.thread).toBeImmutableMap();
    expect(nextState.thread.get(channel.name).messages).toBeImmutableSet();
    expect(nextState.thread.get(channel.name)).toEqualImmutable(threadWithOneMessage);
  });

  it('Should merge thread recived massage to exist thread in store', () => {
    const stateWithOneThreadWithOneMessage = reciveMessageMergeTpState(state, threadWithOneMessage);
    const firstMessage = threadWithOneMessage.get('messages').first();
    const nextMessage = firstMessage.update('messageId', u => u + 1);
    const threadWithNextMessage = threadWithOneMessage.set('messages', nextMessage);
    const nextState = reciveMessageMergeTpState(stateWithOneThreadWithOneMessage, threadWithNextMessage);
    expect(nextState.thread.get(channel.name).messages).toEqualImmutable(Set([firstMessage, nextMessage]));
  });
});
