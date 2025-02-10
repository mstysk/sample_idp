/// <reference lib="deno.unstable" />

import { encode as base64Encode } from "https://deno.land/std@0.200.0/encoding/base64.ts";
import { KVStorage, StorageEntity, StorageInterface } from "../Infra/KV.ts";

function generateSalt(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return base64Encode(randomBytes);
}

export async function generateToken(
  password: string,
): Promise<Authentication> {
  const salt = generateSalt();

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);

  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = base64Encode(new Uint8Array(hashArray));

  const token = `${salt}.${hashBase64}`;

  return { token };
}

type ResourceId = string;
type UserId = string;
type Email = string;
type Password = string;
type Profile = {
  displayName: string;
  avatarUrl: string;
};

type SignupToken = string;
type AccessToken = string;
type RefreshToken = string;
type UserActiveStatus = "pending" | "active" | "suspend" | "deleted";

type AuthTokens = {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
};

enum UserEventType {
  PRE_REGISTERED = "pre_registered",
  REGISTERED = "registered",
  VERIFIRED = "verified",
  PROFILE_UPDATED = "profile_updated",
  PASSWORD_CHANGED = "password_changed",
  LOGGEDIN = "loggedin",
  LOGOUT = "logout",
  SESSION_EXPIRED = "session_expired",
}

interface User extends StorageEntity {
  id: UserId;
  email: Email;
  createdAt: Date;
}

interface UserSignupToken extends StorageEntity {
  id: ResourceId;
  email: Email;
  token: SignupToken;
  expiresAt: Date;
  createdAt: Date;
}

interface UserActive extends StorageEntity {
  id: ResourceId;
  userId: UserId;
  status: UserActiveStatus;
  createdAt: Date;
}

interface UserCredential extends StorageEntity {
  id: string;
  userId: UserId;
  passwordHash: string;
  createdAt: Date;
}

interface UserProfile extends StorageEntity {
  id: ResourceId;
  userId: UserId;
  displayName: string;
  avatarUrl: string;
  createdAt: Date;
}

interface UserEvent extends StorageEntity {
  id: ResourceId;
  userId: UserId;
  type: UserEventType;
  eventData: Record<string, unknown>;
  createdAt: Date;
}

interface UserRepositoryInterface {
  preregister(email: string): Promise<SignupToken>;
  register(
    token: SignupToken,
    password: Password,
    profile: Profile,
  ): Promise<void>;
  updateStatus(userId: UserId, status: UserActiveStatus): Promise<void>;
  findById(userId: UserId): Promise<User | null>;
}

interface AuthenteicateRepositoryInterface {
  signin(
    email: string,
    password: Password,
  ): Promise<AuthTokens | null>;
  logout(token: AccessToken): Promise<void>;
  refresh(refreshToken: RefreshToken): Promise<AuthTokens | null>;
}

class UserRepository implements UserRepositoryInterface {
  private storage: StorageInterface<User>;

  constructor(storage: StorageInterface<User>) {
    this.storage = storage;
  }
}

export async function createUserRepository(): Promise<UserRepositoryInterface> {
  const storage = await KVStorage.create<User>("users");
  return new UserRepository(storage);
}
