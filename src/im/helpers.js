/* @flow */
import {
  Record,
  Map,
  type RecordOf,
  type RecordFactory,
} from 'immutable';
import type {
  ChatState,
  ThreadsItemType,
} from './index.js.flow';

export const chatStateFactory: RecordFactory<ChatState> = new Record({
  threads: new Map(),
});

function messagesMerge(oldValue, newValue, key) {
  if (key === 'messages') return oldValue.concat(newValue);
  return newValue;
}

export function receiveMessageMergeTpState(state: RecordOf<ChatState>, thread: ThreadsItemType): RecordOf<ChatState> {
  return state
    .updateIn(
      ['threads', thread.name],
      // $FlowFixMe
      (u: ThreadsItemType | void) => (u ? u.mergeWith(messagesMerge, thread) : thread),
    );
}
