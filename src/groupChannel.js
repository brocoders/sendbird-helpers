/* @flow */
import type { GroupChannel } from 'sendbird';
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
