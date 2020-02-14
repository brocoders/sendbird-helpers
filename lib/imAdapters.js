
/**
 * sendbird-helpers v0.1.34
 * SendBird helpers
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var immutable = require('immutable');

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
var SenderFactory = new immutable.Record({
  userId: '',
  nickname: '',
  profileUrl: ''
});

function senderAdapter(_ref) {
  var userId = _ref.userId,
      nickname = _ref.nickname,
      profileUrl = _ref.profileUrl;
  return SenderFactory({
    userId: userId,
    nickname: nickname,
    profileUrl: profileUrl
  });
}

function membersAdapter(members) {
  return members.reduce(function (a, v) {
    return a.push(senderAdapter(v));
  }, new immutable.List());
}

var MessageFactory = new immutable.Record({
  messageId: null,
  message: '',
  createdAt: null,
  updatedAt: null,
  sender: SenderFactory(),
  data: ''
});

function messageAdapter(userMessage) {
  /* $FlowFixMe FileMessage | AdminMessage is not implemented */
  var messageId = userMessage.messageId,
      message = userMessage.message,
      createdAt = userMessage.createdAt,
      updatedAt = userMessage.updatedAt,
      data = userMessage.data,
      sender = userMessage.sender;
  return MessageFactory({
    messageId: messageId,
    message: message,
    createdAt: createdAt,
    updatedAt: updatedAt,
    data: data,
    sender: senderAdapter(sender)
  });
}

function messagesListAdapter(userMessages) {
  return userMessages.reduce(function (a, v) {
    return a.add(messageAdapter(v));
  }, new immutable.Set());
}

var documentThreadFactory = new immutable.Record({
  url: '',
  companyId: '',
  documentId: '',
  members: new immutable.List(),
  name: '',
  unreadMessageCount: 0,
  messages: new immutable.Set()
});
function documentThreadAdapter(channel, messages, params) {
  var url = channel.url,
      name = channel.name,
      unreadMessageCount = channel.unreadMessageCount,
      members = channel.members;
  var companyId = params.companyId,
      documentId = params.documentId;
  var membersList = membersAdapter(members);
  var messagesList = messagesListAdapter(messages);
  return documentThreadFactory({
    url: url,
    companyId: companyId,
    documentId: documentId,
    members: membersList,
    name: name,
    unreadMessageCount: unreadMessageCount,
    messages: messagesList
  });
}
var generalThreadFactory = new immutable.Record({
  url: '',
  companyId: '',
  members: new immutable.List(),
  name: '',
  unreadMessageCount: 0,
  messages: new immutable.Set()
});
function generalThreadAdapter(channel, messages, _ref2) {
  var companyId = _ref2.companyId;
  var url = channel.url,
      name = channel.name,
      unreadMessageCount = channel.unreadMessageCount,
      members = channel.members;
  var membersList = membersAdapter(members);
  var messagesList = messagesListAdapter(messages);
  return generalThreadFactory({
    url: url,
    companyId: companyId,
    members: membersList,
    name: name,
    unreadMessageCount: unreadMessageCount,
    messages: messagesList
  });
}

function dth(a, channel, message, params) {
  var thread = documentThreadAdapter(channel, [message], params);
  return a.set(thread.name, thread);
}

function gth(a, channel, message, params) {
  var thread = generalThreadAdapter(channel, [message], params);
  return a.set(thread.name, thread);
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
  return function (channel, messages) {
    return getThreadFromChannel(channel, function (_, params) {
      return documentThreadAdapter(channel, messages, params);
    }, function (_, params) {
      return generalThreadAdapter(channel, messages, params);
    }, function () {
      return null;
    });
  };
}
function channelsToThreads(env, channels) {
  return channels.reduce(channelsFactory(env), new immutable.Map());
}

/*  */
var chatStateFactory = new immutable.Record({
  threads: new immutable.Map()
});

function messagesMerge(oldValue, newValue, key) {
  if (key === 'messages') return oldValue.concat(newValue);
  return newValue;
}

function receiveMessageMergeTpState(state, thread) {
  return state.updateIn(['threads', thread.name], // $FlowFixMe
  function (u) {
    return u ? u.mergeWith(messagesMerge, thread) : thread;
  });
}

exports.channelsToThreads = channelsToThreads;
exports.chatStateFactory = chatStateFactory;
exports.documentThreadAdapter = documentThreadAdapter;
exports.generalThreadAdapter = generalThreadAdapter;
exports.messageReceiveFactory = messageReceiveFactory;
exports.receiveMessageMergeTpState = receiveMessageMergeTpState;
