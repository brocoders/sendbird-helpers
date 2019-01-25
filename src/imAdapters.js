/* @flow */
import type {
  GroupChannel,
  Member,
  UserMessage,
  FileMessage,
  AdminMessage,
  User,
} from 'sendbird';
import {
  Map,
  List,
  Record,
  type RecordOf,
  type RecordFactory,
} from 'immutable';
import {
  getThreadFromChannelFactory,
  type EnvType,
  type DocumentChannelParamsType,
  type GeneralChannelParamsType,
} from './adapters';

type SenderType = {|
  userId: string,
  nickname: string,
  profileUrl: string,
|}

type MessageType = {
  messageId: number,
  message: string,
  createdAt: number,
  updatedAt: number,
  sender: RecordOf<SenderType>,
  data: string,
}

type BaseThread = {|
  url: string,
  companyId: string,
  members: List<RecordOf<SenderType>>,
  name: string,
  unreadMessageCount: number,
  messages: List<RecordOf<MessageType>>,
|}

type DocumentThread = {|
  ...BaseThread,
  documentId: string,
|}

type GeneralThread = BaseThread;

type DocumentThreadType = RecordOf<DocumentThread>;
type GeneralThreadType = RecordOf<GeneralThread>;
type ThreadsContainer = Map<string, DocumentThreadType | GeneralThreadType>;

type SBMessage = UserMessage | FileMessage | AdminMessage;

const emptyList = new List();

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

function messagesListAdapter(userMessages: $ReadOnlyArray<SBMessage>): List<RecordOf<MessageType>> {
  return userMessages.reduce((a, v: SBMessage) => a.push(messageAdapter(v)), emptyList);
}

const documentThreadFactory: RecordFactory<DocumentThread> = new Record({
  url: '',
  companyId: '',
  documentId: '',
  members: new List(),
  name: '',
  unreadMessageCount: 0,
  messages: new List(),
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
  messages: new List(),
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

export function messageReciveFactory(env: EnvType) {
  const getThreadFromChannel = getThreadFromChannelFactory(env);
  return (channel: GroupChannel, message: UserMessage) => getThreadFromChannel(
    channel,
    (_, params) => documentThreadAdapter(channel, [message], params),
    (_, params) => generalThreadAdapter(channel, [message], params),
    () => null,
  );
}

export function channelsToThreads(env: EnvType, channels: $ReadOnlyArray<GroupChannel>): ThreadsContainer {
  return channels.reduce(channelsFactory(env), new Map());
}
