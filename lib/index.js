
/**
 * sendbird-utils v0.0.3
 * SendBird utils
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var SendBird = _interopDefault(require('sendbird'));

/*  */
var DOCUMENT_CHAT_TYPE = 'document_p2p';
var RECONNECTING = 'RECONNECTING';
var CONNECTED = 'CONNECTED';
var FAILED = 'FAILED';
var CONNECTING = 'CONNECTING';
var OPEN = 'OPEN';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

/*  */
var ChatError = function (_Error) {
  _inherits(ChatError, _Error);

  /* :: message: string; */

  /* :: +meta: $ReadOnly<Object>; */
  function ChatError(message, meta) {
    _classCallCheck(this, ChatError);

    var _this = _possibleConstructorReturn(this, (ChatError.__proto__ || Object.getPrototypeOf(ChatError)).call(this));
    _this.name = 'ChatError';
    _this.message = message;

    if (meta) {
      _this.extraData = meta;
    }

    return _this;
  }

  return ChatError;
}(Error);

/*  */
function sbCreatInstance(appId) {
  var newInstance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return new SendBird({
    appId: appId,
    newInstance: newInstance
  });
}
function sbGetInstance() {
  return SendBird.getInstance();
} // export function sbGetPromisedInstance(): Promise<SendBirdInstance> {
//   const instance = SendBird.getInstance();
//   const state = instance.getConnectionState();
//   if (state === 'CONNECTING') {
//     return new Promise((resolve, reject) => {
//       const cHandler: ConnectionHandler = new instance.ConnectionHandler();
//       cHandler.onReconnectSucceeded = () => {
//         resolve(instance);
//       };
//       cHandler.onReconnectFailed = () => {
//         reject();
//       };
//       instance.addConnectionHandler('id', cHandler);
//     });
//   }
//   if (state === 'OPEN') return Promise.resolve(instance);
//   return Promise.reject();
// }

function sbGetConnectedInstance() {
  var sendbird = sbGetInstance();

  if (sendbird && 'getConnectionState' in sendbird) {
    var state = sendbird.getConnectionState();
    if (state !== 'OPEN') throw new ChatError('Is not open WS', state);
    if (state === 'CLOSED') sendbird.reconnect();
  } else {
    throw new ChatError('No Sendbird instance');
  }

  return sendbird;
}

/*  */
function sbConnect(userId, accessToken) {
  var sb = sbGetInstance();

  if (typeof userId === 'string' && typeof accessToken === 'string') {
    return new Promise(function (resolve, reject) {
      sb.connect(userId, accessToken, function (user, error) {
        if (error) {
          reject(error);
        } else {
          if (user && user.userId !== userId) throw new ChatError('Can\'t log in', error);
          resolve(user);
        }
      });
    });
  }

  return Promise.reject(new ChatError('Invalid arguments', {
    userId: userId,
    accessToken: accessToken
  }));
}
function sbDisconnect() {
  var sb = sbGetInstance();
  return new Promise(function (resolve) {
    if (sb) {
      var state = sb.getConnectionState();

      if (state === OPEN && 'disconnect' in sb) {
        sb.disconnect(function () {
          resolve();
        });
      } else {
        // TODO: Analisis connecting state and disconnect after state open
        resolve();
      }
    } else {
      resolve();
    }
  });
}

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
function makeChannelName(buildEnv, participants, companyId, documentId) {
  return [buildEnv, companyId, documentId].concat(_toConsumableArray(participants.slice().sort())).filter(function (f) {
    return f;
  }).join('#');
}

function sbCreateGroupChannelListQuery() {
  var sb = sbGetInstance();
  return sb.GroupChannel.createMyGroupChannelListQuery();
}
function sbGetGroupChannelList(groupChannelListQuery) {
  return new Promise(function (resolve, reject) {
    groupChannelListQuery.next(function (channels, error) {
      if (error) {
        reject(error);
      } else {
        resolve(channels);
      }
    });
  });
}

function fetchChannel(channelListQuery, resolve, reject) {
  var ch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  channelListQuery.next(function (channels, err) {
    var hasNext = channelListQuery.hasNext,
        isLoading = channelListQuery.isLoading;
    /* TODO: futures check
    const lastCounter = channels[channels.length - 1].unreadMessageCount;
    */

    var channelsContsiner = ch.concat(channels);

    if (err) {
      reject(err);
    } else if (hasNext && !isLoading) {
      return fetchChannel(channelListQuery, resolve, reject, channelsContsiner);
    } else {
      resolve(channelsContsiner);
    }
  });
}

function sbChannelList() {
  var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
  var includeEmpty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var channelListQuery = sbCreateGroupChannelListQuery();
  channelListQuery.includeEmpty = includeEmpty;
  channelListQuery.limit = limit;
  return new Promise(function (resolve, reject) {
    fetchChannel(channelListQuery, resolve, reject);
  });
}
function sbGetGroupChannel(channelUrl) {
  var sb = sbGetInstance();
  return new Promise(function (resolve, reject) {
    sb.GroupChannel.getChannel(channelUrl, function (channel, error) {
      if (error) {
        reject(error);
      } else {
        resolve(channel);
      }
    });
  });
}
function sbMarkAsReadByURL(channelUrl) {
  return sbGetGroupChannel(channelUrl).then(function (channel) {
    return channel.markAsRead();
  });
}
function sbGroupChannelExist(name) {
  var channelListQuery = sbCreateGroupChannelListQuery();
  channelListQuery.channelNameContainsFilter = name;
  channelListQuery.includeEmpty = true;
  return sbGetGroupChannelList(channelListQuery).then(function (channels) {
    return channels.filter(function (f) {
      return f.name === name;
    });
  });
}
var sbCreateGroupChannel = function sbCreateGroupChannel(inviteUserIdList, isDistinct, name) {
  var coverUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var data = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
  var customType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
  return new Promise(function (resolve, reject) {
    var sb = sbGetInstance();
    sb.GroupChannel.createChannelWithUserIds(inviteUserIdList, isDistinct, name, coverUrl, data, customType, function (channel, error) {
      if (error) {
        reject(error);
      } else {
        resolve(channel);
      }
    });
  });
};
function sbCreateGroupChannelByName(name) {
  var _getParamsFromChannel = getParamsFromChannelName(name),
      users = _getParamsFromChannel.users,
      companyId = _getParamsFromChannel.companyId,
      rest = _objectWithoutProperties(_getParamsFromChannel, ["users", "companyId"]);

  if (rest.documentId) {
    return sbCreateGroupChannel(users, false, name, '', JSON.stringify({
      companyId: companyId,
      documentId: rest.documentId
    }), DOCUMENT_CHAT_TYPE);
  }

  return sbCreateGroupChannel(users, false, name, '', JSON.stringify({
    companyId: companyId
  }));
}
function sbGetMessageList(previousMessageListQuery) {
  var limit = 30;
  var reverse = true;
  return new Promise(function (resolve, reject) {
    previousMessageListQuery.load(limit, reverse, function (messages, error) {
      if (error) {
        reject(error);
      } else {
        resolve(messages);
      }
    });
  });
}
function sbGetMessagesContainer(_x, _x2) {
  return _sbGetMessagesContainer.apply(this, arguments);
}

function _sbGetMessagesContainer() {
  _sbGetMessagesContainer = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(channelUrl, query) {
    var channel, _messages, listQuery, messages;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return sbGetGroupChannel(channelUrl);

          case 2:
            channel = _context.sent;

            if (!(query && typeof query.load === 'function')) {
              _context.next = 8;
              break;
            }

            _context.next = 6;
            return sbGetMessageList(query);

          case 6:
            _messages = _context.sent;
            return _context.abrupt("return", {
              channel: channel,
              query: query,
              messages: _messages
            });

          case 8:
            listQuery = channel.createPreviousMessageListQuery();
            _context.next = 11;
            return sbGetMessageList(listQuery);

          case 11:
            messages = _context.sent;
            return _context.abrupt("return", {
              channel: channel,
              query: listQuery,
              messages: messages
            });

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _sbGetMessagesContainer.apply(this, arguments);
}

function sbSendTextMessage(channel, textMessage) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (channel.isGroupChannel()) {
    channel.endTyping();
  }

  return new Promise(function (resolve, reject) {
    channel.sendUserMessage(textMessage, data, function (message, error) {
      if (error) {
        reject(error);
      } else {
        resolve(message);
      }
    });
  });
}

exports.CONNECTED = CONNECTED;
exports.CONNECTING = CONNECTING;
exports.DOCUMENT_CHAT_TYPE = DOCUMENT_CHAT_TYPE;
exports.FAILED = FAILED;
exports.OPEN = OPEN;
exports.RECONNECTING = RECONNECTING;
exports.getParamsFromChannelName = getParamsFromChannelName;
exports.getParamsFromChannelNameWithEnv = getParamsFromChannelNameWithEnv;
exports.getThreadFromChannelFactory = getThreadFromChannelFactory;
exports.makeChannelName = makeChannelName;
exports.sbChannelList = sbChannelList;
exports.sbConnect = sbConnect;
exports.sbCreatInstance = sbCreatInstance;
exports.sbCreateGroupChannel = sbCreateGroupChannel;
exports.sbCreateGroupChannelByName = sbCreateGroupChannelByName;
exports.sbCreateGroupChannelListQuery = sbCreateGroupChannelListQuery;
exports.sbDisconnect = sbDisconnect;
exports.sbGetConnectedInstance = sbGetConnectedInstance;
exports.sbGetGroupChannel = sbGetGroupChannel;
exports.sbGetGroupChannelList = sbGetGroupChannelList;
exports.sbGetInstance = sbGetInstance;
exports.sbGetMessageList = sbGetMessageList;
exports.sbGetMessagesContainer = sbGetMessagesContainer;
exports.sbGroupChannelExist = sbGroupChannelExist;
exports.sbMarkAsReadByURL = sbMarkAsReadByURL;
exports.sbSendTextMessage = sbSendTextMessage;
