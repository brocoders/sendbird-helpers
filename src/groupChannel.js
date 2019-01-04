/* @flow */
import type {
  GroupChannel,
  GroupChannelListQuery,
} from 'sendbird';
import { sendBirdInstance } from './instance';

export function channelList(limit: number = 30): Promise<Array<GroupChannel>> {
  const sendbird = sendBirdInstance();
  const channelListQuery = sendbird.GroupChannel.createMyGroupChannelListQuery();
  channelListQuery.limit = limit;
  return new Promise((resolve, reject) => {
    channelListQuery.next((channels, err) => {
      if (err) reject(err);
      if (channels) resolve(channels);
    });
  });
}

export function sbCreateGroupChannelListQuery(): GroupChannelListQuery {
  const sb = sendBirdInstance();
  return sb.GroupChannel.createMyGroupChannelListQuery();
}

export const sbGetGroupChannelList = (groupChannelListQuery: GroupChannelListQuery): Promise<GroupChannel[]> => new Promise((resolve, reject) => {
  groupChannelListQuery.next((channels, error) => {
    if (error) {
      reject(error);
    } else {
      resolve(channels);
    }
  });
});

export const sbGetGroupChannel = (channelUrl: string): Promise<GroupChannel> => new Promise((resolve, reject) => {
  const sb = sendBirdInstance();
  sb.GroupChannel.getChannel(channelUrl, (channel: GroupChannel, error) => {
    if (error) {
      reject(error);
    } else {
      resolve(channel);
    }
  });
});
