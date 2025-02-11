export type ResourceId = string;
export type UserId = string;
export type Email = string;
export type Password = string;
export type PasswordHash = string;
export type Profile = {
  displayName: string;
  avatarUrl: string;
};

export type SignupToken = string;
export type AccessToken = string;
export type RefreshToken = string;
export type UserActiveStatus = "pending" | "active" | "suspend" | "deleted";
export type AuthTokens = {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
};

export enum UserEventType {
  PRE_REGISTERED = "pre_registered",
  REGISTERED = "registered",
  VERIFIRED = "verified",
  PROFILE_UPDATED = "profile_updated",
  PASSWORD_CHANGED = "password_changed",
  LOGGEDIN = "loggedin",
  LOGOUT = "logout",
  SESSION_EXPIRED = "session_expired",
}

export type ToAddresss = string;

export type MailContent = {
  subject: string;
  html: string;
};

export type MailOpts = {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
    type: string;
  };
};
