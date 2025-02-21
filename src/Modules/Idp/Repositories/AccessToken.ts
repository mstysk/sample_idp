import {
  KVStorage,
  StorageEntity,
  StorageInterface,
} from "../../../Infra/KV.ts";
import { ResourceId, UserId } from "../../../Repository/type.ts";
import { Scope } from "../Validator.ts";

export const BEARER_TYPE = "Bearer";
type AccessTokenType = typeof BEARER_TYPE;
type AccessToken = string;

interface AccessTokenEntity extends StorageEntity {
  id: AccessToken;
  userId: UserId;
  scopes: Scope[];
  exp: number;
  type: AccessTokenType;
}

interface AccessTokenRepositoryInterface {
  findById(id: ResourceId): Promise<AccessTokenEntity | null>;
  save(
    userId: UserId,
    scopes: Scope[],
    type: AccessTokenType,
  ): Promise<AccessToken>;
}

class AccessTokenRepository implements AccessTokenRepositoryInterface {
  private accessTokenStorage: StorageInterface<AccessTokenEntity>;

  constructor(accessTokenStorage: StorageInterface<AccessTokenEntity>) {
    this.accessTokenStorage = accessTokenStorage;
  }

  async findById(id: ResourceId): Promise<AccessTokenEntity | null> {
    return await this.accessTokenStorage.findById(id);
  }
  async save(
    userId: UserId,
    scopes: Scope[],
    type: AccessTokenType,
  ) {
    const accessToken = crypto.randomUUID();
    await this.accessTokenStorage.save({
      id: accessToken,
      userId,
      scopes,
      type,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    return accessToken;
  }
}

export async function create(): Promise<AccessTokenRepositoryInterface> {
  const kv = await Deno.openKv();
  return new AccessTokenRepository(
    new KVStorage<AccessTokenEntity>(kv, "access_token"),
  );
}
