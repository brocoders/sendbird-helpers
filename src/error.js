/* @flow */

export class ChatError extends Error {
    constructor(message: string, meta?: Object) {
        super(message);
        this.message = message;
        if (meta) {
            this.extraData = meta;
        }
        this.name = 'Chat Error';
    }

    extraData: ?Object;

}
