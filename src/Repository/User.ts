/// <reference lib="deno.unstable" />

import { encode as base64Encode } from "https://deno.land/std@0.200.0/encoding/base64.ts";
import { KVStorage, StorageEntity, StorageInterface } from "../Infra/KV.ts";

type Profile = {
  username: string;
  email: string;
};

export function isProfile(profile: unknown): profile is Profile {
  if (profile === null || typeof profile !== "object") {
    return false;
  }
  const target = profile as Record<string, unknown>;

  return (
    typeof target.username === "string" &&
    target.username !== null &&
    typeof target.email === "string" &&
    target.email !== null &&
    Object.keys(target).length === 2
  );
}

type Authentication = {
  token: string;
};

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

interface User extends StorageEntity {
  id: string;
  profile: Profile;
  authentication: Authentication;
}

interface UserRepositoryInterface {
  store: (profile: Profile, authentication: Authentication) => Promise<void>;
  update: (user: User) => Promise<void>;
  findById: (id: string) => Promise<User | null>;
}

class UserRepository implements UserRepositoryInterface {
  private storage: StorageInterface<User>;

  constructor(storage: StorageInterface<User>) {
    this.storage = storage;
  }

  async store(profile: Profile, authentication: Authentication) {
    const id = this.generateUserId();

    const user = {
      id,
      profile,
      authentication,
    } as User;

    await this.storage.save(user);

    return;
  }

  async update(user: User): Promise<void> {
    const u = this.storage.findById(user.id);

    if (typeof u === "undefined") {
      throw new Error("User Not Found");
    }

    await this.storage.update(user.id, user);
    return;
  }

  async findById(id: string): Promise<User | null> {
    return await this.storage.findById(id);
  }

  private generateUserId(): string {
    return crypto.randomUUID();
  }
}

export async function createUserRepository(): Promise<UserRepositoryInterface> {
  const storage = await KVStorage.create<User>("users");
  return new UserRepository(storage);
}

