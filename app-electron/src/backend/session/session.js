class Session {
  constructor() {
    this.user = null;
    this.profile = null;
  }

  setUser(user) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  getProfile() {
    return this.profile;
  }

  clear() {
    this.user = null;
    this.profile = null;
  }
}

module.exports = new Session();