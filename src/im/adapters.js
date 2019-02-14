/* @flow */
import type {
  GroupChannel,
  Member,
  UserMessage,
  User,
} from 'sendbird';
import {
  Map,
  List,
  Record,
  Set,
  type RecordOf,
  type RecordFactory,
} from 'immutable';
import {
  getThreadFromChannelFactory,
  type EnvType,
  type DocumentChannelParamsType,
  type GeneralChannelParamsType,
} from '../adapters';
import type {
  SenderType,
  MessageType,
  SBMessage,
  DocumentThread,
  GeneralThread,
  ThreadsContainer,
} from './index.js.flow';


const SenderFactory: RecordFactory<SenderType> = new Record({
  userId: '',
  nickname: '',
  profileUrl: '',
});

function senderAdapter({ userId, nickname, profileUrl }: User): RecordOf<SenderType> {
  return SenderFactory({
    userId,
    nickname,
    profileUrl,
  });
}

function membersAdapter(members: $ReadOnlyArray<Member>): List<RecordOf<SenderType>> {
  return members.reduce((a, v: User) => a.push(senderAdapter(v)), new List());
}

const MessageFactory: RecordFactory<MessageType> = new Record({
  messageId: null,
  message: '',
  createdAt: null,
  updatedAt: null,
  sender: SenderFactory(),
  data: '',
});

function messageAdapter(userMessage : SBMessage): RecordOf<MessageType> {
  /* $FlowFixMe FileMessage | AdminMessage is not implemented */
  const { messageId, message, createdAt, updatedAt, data, sender } = userMessage;
  return MessageFactory({
    messageId,
    message,
    createdAt,
    updatedAt,
    data,
    sender: senderAdapter(sender),
  });
}

function messagesListAdapter(userMessages: $ReadOnlyArray<SBMessage>): Set<RecordOf<MessageType>> {
  return userMessages.reduce((a, v: SBMessage) => a.add(messageAdapter(v)), new Set());
}

const documentThreadFactory: RecordFactory<DocumentThread> = new Record({
  url: '',
  companyId: '',
  documentId: '',
  members: new List(),
  name: '',
  unreadMessageCount: 0,
  messages: new Set(),
});

export function documentThreadAdapter(channel: GroupChannel, messages: $ReadOnlyArray<SBMessage>, params: $ReadOnly<DocumentChannelParamsType>): RecordOf<DocumentThread> {
  const { url, name, unreadMessageCount, members } = channel;
  const { companyId, documentId } = params;
  const membersList = membersAdapter(members);
  const messagesList = messagesListAdapter(messages);
  return documentThreadFactory({
    url,
    companyId,
    documentId,
    members: membersList,
    name,
    unreadMessageCount,
    messages: messagesList,
  });
}

const generalThreadFactory: RecordFactory<GeneralThread> = new Record({
  url: '',
  companyId: '',
  members: new List(),
  name: '',
  unreadMessageCount: 0,
  messages: new Set(),
});

export function generalThreadAdapter(channel: GroupChannel, messages: $ReadOnlyArray<SBMessage>, { companyId }: $ReadOnly<GeneralChannelParamsType>): RecordOf<GeneralThread> {
  const { url, name, unreadMessageCount, members } = channel;
  const membersList = membersAdapter(members);
  const messagesList = messagesListAdapter(messages);
  return generalThreadFactory({
    url,
    companyId,
    members: membersList,
    name,
    unreadMessageCount,
    messages: messagesList,
  });
}

function dth(a: ThreadsContainer, channel: GroupChannel, message: SBMessage, params: $ReadOnly<DocumentChannelParamsType>): ThreadsContainer {
  const thread = documentThreadAdapter(channel, [message], params);
  return a.set(thread.name, thread);
}

function gth(a: ThreadsContainer, channel: GroupChannel, message: SBMessage, params: $ReadOnly<GeneralChannelParamsType>): ThreadsContainer {
  const thread = generalThreadAdapter(channel, [message], params);
  return a.set(thread.name, thread);
}

function channelsFactory(env: EnvType) {
  const getThreadFromChannel = getThreadFromChannelFactory(env);
  return (a: ThreadsContainer, channel: GroupChannel) => {
    const { lastMessage } = channel;
    return getThreadFromChannel(
      channel,
      (_, params) => dth(a, channel, lastMessage, params),
      (_, params) => gth(a, channel, lastMessage, params),
      () => a,
    );
  };
}

export function messageReceiveFactory(env: EnvType) {
  const getThreadFromChannel = getThreadFromChannelFactory(env);
  return (channel: GroupChannel, messages: $ReadOnlyArray<UserMessage>) => getThreadFromChannel(
    channel,
    (_, params) => documentThreadAdapter(channel, messages, params),
    (_, params) => generalThreadAdapter(channel, messages, params),
    () => null,
  );
}

export function channelsToThreads(env: EnvType, channels: $ReadOnlyArray<GroupChannel>): ThreadsContainer {
  return channels.reduce(channelsFactory(env), new Map());
}
