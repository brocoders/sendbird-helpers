export default class SBMock {
  constructor(apiKey: string) {
  
  }

  connect(userId: string, accessToken: string, cb: (user: ?User, error: ?Error) => void) {
    cb({ userId }, null);
  }

}
