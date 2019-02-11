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

export function sbChannelList(limit: number = 30): Promise<$ReadOnlyArray<GroupChannel>> {
  const channelListQuery = sbCreateGroupChannelListQuery();
  channelListQuery.limit = limit;
  return new Promise((resolve, reject) => {
    channelListQuery.next((channels, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(channels);
      }
    });
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

export const sbGetMessageList = (previousMessageListQuery: PreviousMessageListQuery): Promise<$ReadOnlyArray<UserMessage | FileMessage | AdminMessage>> => {
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
};
