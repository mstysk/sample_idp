/// <reference lib="deno.unstable" />

import { encode as base64Encode } from "https://deno.land/std@0.200.0/encoding/base64.ts";
import { KVStorage, StorageEntity, StorageInterface } from "../Infra/KV.ts";
import {
  Email,
  Password,
  PasswordHash,
  Profile,
  ResourceId,
  SignupToken,
  UserActiveStatus,
  UserEventType,
  UserId,
} from "./type.ts";

function generateSalt(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return base64Encode(randomBytes.buffer);
}

export async function generatePassowrdHash(
  password: string,
): Promise<PasswordHash> {
  const salt = generateSalt();

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);

  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);

  const _hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = base64Encode(hashBuffer);

  const token = `${salt}.${hashBase64}`;

  return token;
}

async function verifyPassword(
  password: Password,
  passwordHash: PasswordHash,
): Promise<boolean> {
  const [salt, hash] = passwordHash.split(".");

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);

  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);

  const _hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = base64Encode(hashBuffer);

  return hashBase64 === hash;
}

const generateResourceId = (): ResourceId => crypto.randomUUID();

export type UserType = User & UserProfile;

export function isUserType(object: object): object is UserType {
  return "displayName" in object &&
    "avatarUrl" in object &&
    "id" in object &&
    "email" in object &&
    "createdAt" in object;
}

interface User extends StorageEntity {
  id: UserId;
  email: Email;
  createdAt: Date;
}

interface UserSignupToken extends StorageEntity {
  id: SignupToken;
  email: Email;
  expiredAt: Date;
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
  resourceId: ResourceId | UserId | SignupToken;
  type: UserEventType;
  eventData: Record<string, unknown>;
  createdAt: Date;
}

export interface UserRepositoryInterface {
  preregister(email: Email): Promise<SignupToken>;
  register(
    token: SignupToken,
    password: Password,
    profile: Partial<Profile>,
  ): Promise<void>;
  updateStatus(userId: UserId, status: UserActiveStatus): Promise<void>;
  findById(userId: UserId): Promise<UserType | null>;
  findByEmail(email: Email): Promise<UserType | null>;
  verifyToken(token: SignupToken): Promise<boolean>;
  verifyPassword(userId: UserId, password: Password): Promise<boolean>;
  close(): void;
}

class UserRepository implements UserRepositoryInterface {
  private storage: StorageInterface<User>;
  private signupTokenStorage: StorageInterface<UserSignupToken>;
  private activeStorage: StorageInterface<UserActive>;
  private credentialStorage: StorageInterface<UserCredential>;
  private profileStorage: StorageInterface<UserProfile>;
  private eventStorage: StorageInterface<UserEvent>;

  private emailKey = "user_by_email" as const;

  constructor(
    storage: StorageInterface<User>,
    signupTokenStorage: StorageInterface<UserSignupToken>,
    activeStorage: StorageInterface<UserActive>,
    credentialStorage: StorageInterface<UserCredential>,
    profileStorage: StorageInterface<UserProfile>,
    eventStorage: StorageInterface<UserEvent>,
  ) {
    this.storage = storage;
    this.signupTokenStorage = signupTokenStorage;
    this.activeStorage = activeStorage;
    this.credentialStorage = credentialStorage;
    this.profileStorage = profileStorage;
    this.eventStorage = eventStorage;
  }

  async preregister(email: Email): Promise<SignupToken> {
    const id = generateResourceId();
    const now = new Date();
    await this.signupTokenStorage.save({
      id,
      email,
      expiredAt: new Date(now.setHours(now.getHours() + 1)),
      createdAt: now,
    });
    await this.eventStorage.save({
      id,
      resourceId: id,
      type: UserEventType.PRE_REGISTERED,
      eventData: {
        email,
      },
      createdAt: now,
    });
    return id;
  }

  async register(
    token: SignupToken,
    password: Password,
    profile: Profile,
  ): Promise<void> {
    const id = generateResourceId();
    const signUp = await this.signupTokenStorage.findById(token);
    if (!signUp) {
      throw new Error("Invalid signup token");
    }
    const passwordHash = await generatePassowrdHash(password);
    const user = {
      id,
      email: signUp.email,
      createdAt: new Date(),
    } as User;
    await this.storage.save(user);
    await this.storage.save(user, this.emailKey, "email");
    await this.profileStorage.save({
      id,
      userId: id,
      ...profile,
      createdAt: new Date(),
    });
    await this.activeStorage.save({
      id,
      userId: id,
      status: "active",
      createdAt: new Date(),
    });
    await this.credentialStorage.save({
      id,
      userId: id,
      passwordHash,
      createdAt: new Date(),
    });
    await this.eventStorage.save({
      id,
      resourceId: id,
      type: UserEventType.REGISTERED,
      eventData: {
        token,
        email: signUp.email,
        profile,
      },
      createdAt: new Date(),
    });
    await this.signupTokenStorage.delete(token);
  }
  async updateStatus(userId: UserId, status: UserActiveStatus): Promise<void> {
    await this.activeStorage.update(userId, { status });
  }
  async findById(userId: UserId): Promise<UserType | null> {
    const u = await this.storage.findById(userId);
    if (!u) {
      return null;
    }
    const p = await this.profileStorage.findById(userId);
    if (!p) {
      return null;
    }
    return { ...u, ...p };
  }
  async findByEmail(email: Email): Promise<UserType | null> {
    const user = await this.storage.findByPrefix(this.emailKey, email);
    if (!user) {
      return null;
    }
    return this.findById(user.id);
  }
  async verifyToken(token: SignupToken): Promise<boolean> {
    const signUp = await this.signupTokenStorage.findById(token);
    if (!signUp) {
      throw new Error("Invalid signup token");
    }
    if (signUp.expiredAt < new Date()) {
      throw new Error("Signup token has expired");
    }
    return true;
  }
  async verifyPassword(userId: UserId, password: Password): Promise<boolean> {
    const credential = await this.credentialStorage.findById(userId);
    if (!credential) {
      return false;
    }
    return await verifyPassword(password, credential.passwordHash);
  }

  close(): void {
    this.storage.close();
    this.signupTokenStorage.close();
    this.activeStorage.close();
    this.credentialStorage.close();
    this.profileStorage.close();
    this.eventStorage.close();
  }
}

export async function createUserRepository(): Promise<UserRepositoryInterface> {
  return new UserRepository(
    await KVStorage.create<User>("users"),
    await KVStorage.create<UserSignupToken>("signup_tokens"),
    await KVStorage.create<UserActive>("active"),
    await KVStorage.create<UserCredential>("credentials"),
    await KVStorage.create<UserProfile>("profiles"),
    await KVStorage.create<UserEvent>("events"),
  );
}
