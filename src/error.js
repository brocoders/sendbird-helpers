/* @flow */

export class ChatError extends Error {
    /* :: message: string; */
    /* :: +meta: $ReadOnly<Object>; */

    constructor(
      message: string,
      meta?: Object
    ) {
      super();
      this.name = 'ChatError'
      this.message = message;
      if (meta) {
          this.extraData = meta;
      }
    }

    extraData: ?Object;

}
