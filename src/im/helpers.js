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
  thread: new Map(),
});

function messagesMerge(oldValue, newValue, key) {
  if (key === 'messages') return oldValue.add(newValue);
  return newValue;
}

export function reciveMessageMergeTpState(state: RecordOf<ChatState>, thread: ThreadsItemType): RecordOf<ChatState> {
  return state
    .updateIn(
      ['thread', thread.name],
      // $FlowFixMe
      (u: ThreadsItemType | void) => (u ? u.mergeWith(messagesMerge, thread) : thread),
    );
}
