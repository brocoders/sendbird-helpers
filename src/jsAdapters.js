/* @flow */
import type {
  GroupChannel,
  Member,
  UserMessage,
} from 'sendbird';
import map from 'lodash/fp/map';
import pick from 'lodash/fp/pick';
import compose from 'lodash/fp/compose';
import set from 'lodash/fp/set';

import { getParamsFromChannelName } from './groupChannel';

export const DOCUMENT_CHAT_TYPE = 'document_p2p';
const BUILD_ENV = 'staging';

type ThreadsContainer = {
  threads: $PropertyType<ChatStore, 'threads'>;
}

type ChannelHandler<T> = (channel: GroupChannel) => T;

export function membersAdapter(members: Member[]): SenderType[] {
  return map(pick(['userId', 'nickname', 'profileUrl']))(members);
}

export function messageFactory(message: UserMessage): MessageType {
  return compose(
    set('sender')(pick(['nickname', 'userId', 'profileUrl'])(message.sender)),
    pick(['messageId', 'message', 'createdAt', 'updatedAt', 'sender', 'data']),
  )(message);
}

export function getCompanyId(channel: { data: string }): ?DataType {
  try {
    const data: DataType = JSON.parse(channel.data);
    if (data && 'companyId' in data && data.companyId) {
      return data;
    }
  } catch (err) {
    return null;
  }
  return null;
}

export function getThreadFromChannel<T>(
  channel: GroupChannel,
  doc: ChannelHandler<T>,
  gen: ChannelHandler<T>,
  n: ChannelHandler<T>,
): T {
  const params = getParamsFromChannelName(channel.name);
  if (params.env !== BUILD_ENV) return n(channel);
  if (channel.customType === DOCUMENT_CHAT_TYPE) {
    if (typeof params.documentId === 'undefined') return n(channel);
    return doc(channel);
  }
  return gen(channel);
}

// eslint-disable-next-line max-len
export function documentThreadsFactory(channel: GroupChannel, messages: UserMessage[]): DocumentThreadType {
  const params = getParamsFromChannelName(channel.name);
  return {
    url: channel.url,
    companyId: params.companyId,
    documentId: params.documentId,
    members: membersAdapter(channel.members),
    name: channel.name,
    unreadMessageCount: channel.unreadMessageCount,
    messages: map(messageFactory)(messages),
  };
}

// eslint-disable-next-line max-len
export function generalThreadsFactory(channel: GroupChannel, messages: UserMessage[]): GeneralThreadType {
  const params = getParamsFromChannelName(channel.name);
  return {
    url: channel.url,
    companyId: params.companyId,
    members: membersAdapter(channel.members),
    name: channel.name,
    unreadMessageCount: channel.unreadMessageCount,
    messages: map(messageFactory)(messages),
  };
}

function dth(a: ThreadsContainer, channel: GroupChannel, message: UserMessage): ThreadsContainer {
  const thread = documentThreadsFactory(channel, [message]);
  return set(['threads', thread.name])(thread)(a);
}

function gth(a: ThreadsContainer, channel: GroupChannel, message: UserMessage): ThreadsContainer {
  const thread = generalThreadsFactory(channel, [message]);
  return set(['threads', thread.name])(thread)(a);
}

function channelsFactory(a: ThreadsContainer, channel: GroupChannel): ThreadsContainer {
  return getThreadFromChannel(
    channel,
    c => dth(a, c, c.lastMessage),
    c => gth(a, c, c.lastMessage),
    () => a,
  );
}

const threadsContainer = () => ({
  threads: {},
});

export function channelsToThreads(channels: Array<GroupChannel>): ThreadsContainer {
  return channels.reduce(channelsFactory, threadsContainer());
}