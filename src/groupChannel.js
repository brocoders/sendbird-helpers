/* @flow */
import type {
  GroupChannel,
  GroupChannelListQuery,
  PreviousMessageListQuery,
  UserMessage,
  FileMessage,
  AdminMessage,
} from 'sendbird';
import { sbGetInstance } from './instance';
import { getParamsFromChannelName } from './adapters';
import { DOCUMENT_CHAT_TYPE } from './constants';

export function sbCreateGroupChannelListQuery(): GroupChannelListQuery {
  const sb = sbGetInstance();
  return sb.GroupChannel.createMyGroupChannelListQuery();
}

export function sbGetGroupChannelList(groupChannelListQuery: GroupChannelListQuery): Promise<$ReadOnlyArray<GroupChannel>> {
  return new Promise((resolve, reject) => {
    groupChannelListQuery.next((channels, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(channels);
      }
    });
  });
}

function fetchChannel(
  channelListQuery: GroupChannelListQuery,
  resolve,
  reject,
  ch: $ReadOnlyArray<GroupChannel> = [],
) {
  channelListQuery.next((channels, err) => {
    const { hasNext, isLoading } = channelListQuery;
    /* TODO: 
    const lastCounter = channels[channels.length - 1].unreadMessageCount;
    */
    const channelsContsiner = ch.concat(channels);
    if (err) {
      reject(err);
    } else if (hasNext && !isLoading) {
      return fetchChannel(channelListQuery, resolve, reject, ch.concat(channelsContsiner));
    } else {
      resolve(channelsContsiner);
    }
  });
}

export function sbChannelList(limit: number = 5): Promise<$ReadOnlyArray<GroupChannel>> {
  const channelListQuery = sbCreateGroupChannelListQuery();
  channelListQuery.limit = limit;
  return new Promise((resolve, reject) => {
    fetchChannel(channelListQuery, resolve, reject);
  });
}

export function sbGetGroupChannel(channelUrl: string): Promise<GroupChannel> {
  const sb = sbGetInstance();
  return new Promise((resolve, reject) => {
    sb.GroupChannel.getChannel(channelUrl, (channel: GroupChannel, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(channel);
      }
    });
  });
}

export function sbMarkAsReadByURL(channelUrl: string): Promise<void> {
  return sbGetGroupChannel(channelUrl).then((channel: GroupChannel) => channel.markAsRead());
}

export function sbGroupChannelExist(name: string): Promise<$ReadOnlyArray<GroupChannel>> {
  const channelListQuery = sbCreateGroupChannelListQuery();
  channelListQuery.channelNameContainsFilter = name;
  channelListQuery.includeEmpty = true;
  return sbGetGroupChannelList(channelListQuery)
    .then(channels => channels.filter(f => f.name === name));
}

export const sbCreateGroupChannel = (
  inviteUserIdList: $ReadOnlyArray<string>,
  isDistinct: boolean,
  name: string,
  coverUrl: string | File = '',
  data: string = '',
  customType: string = '',
): Promise<GroupChannel> => new Promise((resolve, reject) => {
  const sb = sbGetInstance();
  sb.GroupChannel.createChannelWithUserIds(
    inviteUserIdList,
    isDistinct,
    name,
    coverUrl,
    data,
    customType,
    (channel, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(channel);
      }
    },
  );
});

export function sbCreateGroupChannelByName(name: string): Promise<GroupChannel> {
  const { users, companyId, ...rest } = getParamsFromChannelName(name);
  if (rest.documentId) {
    return sbCreateGroupChannel(
      users,
      false,
      name,
      '',
      JSON.stringify({ companyId, documentId: rest.documentId }),
      DOCUMENT_CHAT_TYPE,
    );
  }
  return sbCreateGroupChannel(users, false, name, '', JSON.stringify({ companyId }));
}

type MessagesType = $ReadOnlyArray<UserMessage | FileMessage | AdminMessage>;

export function sbGetMessageList(previousMessageListQuery: PreviousMessageListQuery): Promise<MessagesType> {
  const limit = 30;
  const reverse = true;
  return new Promise((resolve, reject) => {
    previousMessageListQuery.load(limit, reverse, (messages, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(messages);
      }
    });
  });
}

export async function sbGetMessagesContainer(channelUrl: string, query?: PreviousMessageListQuery) {
  const channel: GroupChannel = await sbGetGroupChannel(channelUrl);
  if (query && typeof query.load === 'function') {
    const messages: MessagesType = await sbGetMessageList(query);
    return {
      channel,
      query,
      messages,
    };
  }
  const listQuery: PreviousMessageListQuery = channel.createPreviousMessageListQuery();
  const messages: MessagesType = await sbGetMessageList(listQuery);
  return {
    channel,
    query: listQuery,
    messages,
  };
}

export function sbSendTextMessage(channel: GroupChannel, textMessage: string, data: string = ''): Promise<UserMessage> {
  if (channel.isGroupChannel()) {
    channel.endTyping();
  }
  return new Promise((resolve, reject) => {
    channel.sendUserMessage(textMessage, data, (message, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(message);
      }
    });
  });
}
