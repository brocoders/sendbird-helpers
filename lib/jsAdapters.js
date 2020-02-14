
/**
 * sendbird-helpers v0.1.34
 * SendBird helpers
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var map = _interopDefault(require('lodash/fp/map'));
var pick = _interopDefault(require('lodash/fp/pick'));
var compose = _interopDefault(require('lodash/fp/compose'));
var set = _interopDefault(require('lodash/fp/set'));

/*  */
function getParamsFromChannelName(channelName) {
  var params = channelName.split('#');
  var env = params[0];

  if (env !== 'staging' && env !== 'development' && env !== 'production' && env !== 'local') {
    // $FlowFixMe
    return null;
  }

  if (params.length === 5) {
    return {
      env: env,
      companyId: params[1],
      documentId: params[2],
      users: params.slice(-2).sort()
    };
  }

  return {
    env: env,
    companyId: params[1],
    users: params.slice(-2).sort()
  };
}
function getParamsFromChannelNameWithEnv(buildEnv, channelName) {
  if (channelName.startsWith(buildEnv)) {
    return getParamsFromChannelName(channelName);
  }

  return null;
}
function getThreadFromChannelFactory(buildEnv) {
  return function getThreadFromChannel(channel, documentChannelAdapter, generalChannelAdapter, n) {
    var params = getParamsFromChannelNameWithEnv(buildEnv, channel.name);

    if (params) {
      if (params.documentId) {
        return documentChannelAdapter(channel, params);
      } // $FlowFixMe is real GeneralChannelParamsType


      return generalChannelAdapter(channel, params);
    }

    return n(channel, params);
  };
}

/*  */
function membersAdapter(members) {
  return map(pick(['userId', 'nickname', 'profileUrl']))(members);
}
function messageFactory(message) {
  return compose(set('sender')(pick(['nickname', 'userId', 'profileUrl'])(message.sender)), pick(['messageId', 'message', 'createdAt', 'updatedAt', 'sender', 'data']))(message);
} // eslint-disable-next-line max-len

function documentThreadAdapter(channel, messages, params) {
  var companyId = params.companyId,
      documentId = params.documentId;
  return {
    url: channel.url,
    companyId: companyId,
    documentId: documentId,
    members: membersAdapter(channel.members),
    name: channel.name,
    unreadMessageCount: channel.unreadMessageCount,
    messages: map(messageFactory)(messages)
  };
} // eslint-disable-next-line max-len

function generalThreadAdapter(channel, messages, params) {
  var companyId = params.companyId;
  return {
    url: channel.url,
    companyId: companyId,
    members: membersAdapter(channel.members),
    name: channel.name,
    unreadMessageCount: channel.unreadMessageCount,
    messages: map(messageFactory)(messages)
  };
}

function dth(a, channel, message, params) {
  var thread = documentThreadAdapter(channel, [message], params);
  return set([thread.name])(thread)(a);
}

function gth(a, channel, message, params) {
  var thread = generalThreadAdapter(channel, [message], params);
  return set([thread.name])(thread)(a);
}

function channelsFactory(env) {
  var getThreadFromChannel = getThreadFromChannelFactory(env);
  return function (a, channel) {
    var lastMessage = channel.lastMessage;
    return getThreadFromChannel(channel, function (_, params) {
      return dth(a, channel, lastMessage, params);
    }, function (_, params) {
      return gth(a, channel, lastMessage, params);
    }, function () {
      return a;
    });
  };
}

function messageReceiveFactory(env) {
  var getThreadFromChannel = getThreadFromChannelFactory(env);
  return function (channel, message) {
    return getThreadFromChannel(channel, function (_, params) {
      return documentThreadAdapter(channel, [message], params);
    }, function (_, params) {
      return generalThreadAdapter(channel, [message], params);
    }, function () {
      return null;
    });
  };
}
function channelsToThreads(env, channels) {
  return channels.reduce(channelsFactory(env), {});
}

exports.channelsToThreads = channelsToThreads;
exports.documentThreadAdapter = documentThreadAdapter;
exports.generalThreadAdapter = generalThreadAdapter;
exports.membersAdapter = membersAdapter;
exports.messageFactory = messageFactory;
exports.messageReceiveFactory = messageReceiveFactory;
