/* @flow */
import type {
  GroupChannel,
  GroupChannelListQuery,
} from 'sendbird';
import { ChatError } from './error';
import { sbGetInstance } from './instance';

type EnvType = 'staging' | 'development' | 'production' | 'local';

export type ParamsChannel = {|
  env: EnvType,
  companyId: string,
  users: Array<string>,
  documentId: ?string,
|};

export function getParamsFromChannelName(channelName: string): ParamsChannel {
  const params = channelName.split('#');
  const env = params[0];
  if (env !== 'staging' && env !== 'development' && env !== 'production' && env !== 'local') {
    throw new ChatError(`Unknown environment ${env} in ${channelName}`);
  }
  return {
    env,
    companyId: params[1],
    documentId: params.length === 5 ? params[2] : undefined,
    users: params.slice(-2),
  };
}

export function channelList(limit: number = 30): Promise<Array<GroupChannel>> {
  const sb = sbGetInstance();
  const channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
  channelListQuery.limit = limit;
  return new Promise((resolve, reject) => {
    channelListQuery.next((channels, err) => {
      if (err) reject(err);
      if (channels) resolve(channels);
    });
  });
}

export function sbCreateGroupChannelListQuery(): GroupChannelListQuery {
  const sb = sbGetInstance();
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
  const sb = sbGetInstance();
  sb.GroupChannel.getChannel(channelUrl, (channel: GroupChannel, error) => {
    if (error) {
      reject(error);
    } else {
      resolve(channel);
    }
  });
});
