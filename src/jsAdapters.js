/* @flow */
import type {
  GroupChannel,
  Member,
  UserMessage,
  FileMessage,
  AdminMessage,
} from 'sendbird';
import map from 'lodash/fp/map';
import pick from 'lodash/fp/pick';
import compose from 'lodash/fp/compose';
import set from 'lodash/fp/set';

import {
  getThreadFromChannelFactory,
  type EnvType,
  type GeneralChannelParamsType,
  type DocumentChannelParamsType,
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
  sender:SenderType,
  data: string,
}

type BaseThread = {|
  url: string,
  companyId: string,
  members: $ReadOnlyArray<SenderType>,
  name: string,
  unreadMessageCount: number,
  messages: $ReadOnlyArray<MessageType>,
|}

type DocumentThreadType = {|
  ...BaseThread,
  documentId: string,
|}

type GeneralThreadType = BaseThread;

type ThreadsContainer = {
  [key: string]: DocumentThreadType | GeneralThreadType,
};

type SBMessage = UserMessage | FileMessage | AdminMessage;

export function membersAdapter(members: $ReadOnlyArray<Member>): $ReadOnlyArray<SenderType> {
  return map(pick(['userId', 'nickname', 'profileUrl']))(members);
}

export function messageFactory(message: UserMessage): MessageType {
  return compose(
    set('sender')(pick(['nickname', 'userId', 'profileUrl'])(message.sender)),
    pick(['messageId', 'message', 'createdAt', 'updatedAt', 'sender', 'data']),
  )(message);
}

// eslint-disable-next-line max-len
export function documentThreadAdapter(channel: GroupChannel, messages: $ReadOnlyArray<SBMessage>, params: $ReadOnly<DocumentChannelParamsType>): DocumentThreadType {
  const { companyId, documentId } = params;
  return {
    url: channel.url,
    companyId,
    documentId,
    members: membersAdapter(channel.members),
    name: channel.name,
    unreadMessageCount: channel.unreadMessageCount,
    messages: map(messageFactory)(messages),
  };
}

// eslint-disable-next-line max-len
export function generalThreadAdapter(channel: GroupChannel, messages: $ReadOnlyArray<SBMessage>, params: $ReadOnly<GeneralChannelParamsType>): GeneralThreadType {
  const { companyId } = params;
  return {
    url: channel.url,
    companyId,
    members: membersAdapter(channel.members),
    name: channel.name,
    unreadMessageCount: channel.unreadMessageCount,
    messages: map(messageFactory)(messages),
  };
}

function dth(a: ThreadsContainer, channel: GroupChannel, message: SBMessage, params: $ReadOnly<DocumentChannelParamsType>): ThreadsContainer {
  const thread = documentThreadAdapter(channel, [message], params);
  return set([thread.name])(thread)(a);
}

function gth(a: ThreadsContainer, channel: GroupChannel, message: SBMessage, params: $ReadOnly<GeneralChannelParamsType>): ThreadsContainer {
  const thread = generalThreadAdapter(channel, [message], params);
  return set([thread.name])(thread)(a);
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
  return (channel: GroupChannel, message: UserMessage) => getThreadFromChannel(
    channel,
    (_, params) => documentThreadAdapter(channel, [message], params),
    (_, params) => generalThreadAdapter(channel, [message], params),
    () => null,
  );
}

export function channelsToThreads(env: EnvType, channels: $ReadOnlyArray<GroupChannel>): ThreadsContainer {
  return channels.reduce(channelsFactory(env), {});
}
