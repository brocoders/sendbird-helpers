/* @flow */
import type { GroupChannel } from 'sendbird';
import { DOCUMENT_CHAT_TYPE } from './constants';
import { ChatError } from './error';

export type EnvType = 'staging' | 'development' | 'production' | 'local';

export type ChannelAdapter<P, T = *> = (channel: $ReadOnly<GroupChannel>, params: P) => T;

export type GeneralChannelParamsType = {|
  env: EnvType,
  companyId: string,
  users: string[],
|}

export type DocumentChannelParamsType = {|
  env: EnvType,
  companyId: string,
  users: string[],
  documentId: string,
|}

export type ParamsChannel = GeneralChannelParamsType | DocumentChannelParamsType;

export function getParamsFromChannelName(channelName: string): ParamsChannel | null {
  const params = channelName.split('#');
  const env = params[0];
  if (env !== 'staging' && env !== 'development' && env !== 'production' && env !== 'local') {
    return null;
    // throw new ChatError(`Unknown environment`, { env, channelName });
  }
  if (params.length === 5) {
    return ({
      env,
      companyId: params[1],
      documentId: params[2],
      users: params.slice(-2),
    }: DocumentChannelParamsType);
  }
  return ({
    env,
    companyId: params[1],
    users: params.slice(-2),
  }: GeneralChannelParamsType);
}

export function getThreadFromChannelFactory(env: EnvType) {
  return function getThreadFromChannel(
    channel: GroupChannel,
    documentChannelAdapter: ChannelAdapter<$ReadOnly<DocumentChannelParamsType>, *>,
    generalChannelAdapter: ChannelAdapter<$ReadOnly<GeneralChannelParamsType>, *>,
    n: ChannelAdapter<null, *>,
  ) {
    const params = getParamsFromChannelName(channel.name);

    if (params) {
      if (params.documentId) {
        return documentChannelAdapter(channel, params);
      }
      // $FlowFixMe is real GeneralChannelParamsType
      return generalChannelAdapter(channel, params);
    }
    return n(channel, params);
  }
}
