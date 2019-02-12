/* @flow */
import type { GroupChannel } from 'sendbird';

export type EnvType = 'staging' | 'development' | 'production' | 'local';

export type ChannelAdapter<P, T = *> = (channel: $ReadOnly<GroupChannel>, params: P) => T;

export type GeneralChannelParamsType = {|
  env: EnvType,
  companyId: string,
  users: $ReadOnlyArray<string>,
|}

export type DocumentChannelParamsType = {|
  env: EnvType,
  companyId: string,
  users: $ReadOnlyArray<string>,
  documentId: string,
|}

export type ParamsChannel = GeneralChannelParamsType | DocumentChannelParamsType;

export function getParamsFromChannelName(channelName: string): ParamsChannel {
  const params = channelName.split('#');
  const env = ((params[0]: any): EnvType);
  if (env !== 'staging' && env !== 'development' && env !== 'production' && env !== 'local') {
    // $FlowFixMe
    return null;
  }
  if (params.length === 5) {
    return ({
      env,
      companyId: params[1],
      documentId: params[2],
      users: params.slice(-2).sort(),
    }: DocumentChannelParamsType);
  }
  return ({
    env,
    companyId: params[1],
    users: params.slice(-2).sort(),
  }: GeneralChannelParamsType);
}

export function getParamsFromChannelNameWithEnv(buildEnv: EnvType, channelName: string): ParamsChannel | null {
  if (channelName.startsWith(buildEnv)) {
    return getParamsFromChannelName(channelName);
  }
  return null;
}

export function getThreadFromChannelFactory(buildEnv: EnvType) {
  return function getThreadFromChannel(
    channel: GroupChannel,
    documentChannelAdapter: ChannelAdapter<$ReadOnly<DocumentChannelParamsType>, *>,
    generalChannelAdapter: ChannelAdapter<$ReadOnly<GeneralChannelParamsType>, *>,
    n: ChannelAdapter<null, *>,
  ) {
    const params = getParamsFromChannelNameWithEnv(buildEnv, channel.name);

    if (params) {
      if (params.documentId) {
        return documentChannelAdapter(channel, params);
      }
      // $FlowFixMe is real GeneralChannelParamsType
      return generalChannelAdapter(channel, params);
    }
    return n(channel, params);
  };
}

export function makeChannelName(
  buildEnv: EnvType,
  participants: $ReadOnlyArray<string>,
  companyId: string,
  documentId?: string,
): string {
  return [
    buildEnv,
    companyId,
    documentId,
    ...participants.slice().sort(),
  ].filter(f => f).join('#');
}
