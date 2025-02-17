import { JWTPayload } from "npm:jose";
import { StorageInterface } from "../../../Infra/KV.ts";
import { ResourceId } from "../../../Repository/type.ts";
import { StorageEntity } from "../../../Infra/KV.ts";
import { KVStorage } from "../../../Infra/KV.ts";
type AuthCode = string;

export interface AuthCodeRepositoryInterface {
  save(authCode: AuthCode, payload: JWTPayload): Promise<void>;
  findByCode(code: AuthCode): Promise<JWTPayload | null>;
}

interface AuthCodeEntity extends StorageEntity {
  id: ResourceId;
  payload: JWTPayload;
}

class AuthCodeRepository implements AuthCodeRepositoryInterface {
  private authCodeStorage: StorageInterface<AuthCodeEntity>;
  constructor(
    authCodeStorage: StorageInterface<AuthCodeEntity>,
  ) {
    this.authCodeStorage = authCodeStorage;
  }
  async save(authCode: AuthCode, payload: JWTPayload): Promise<void> {
    await this.authCodeStorage.save({
      id: authCode,
      payload,
    });
  }
  async findByCode(code: AuthCode): Promise<AuthCodeEntity | null> {
    return await this.authCodeStorage.findById(code);
  }
}

export async function createFromKV() {
  const kv = await Deno.openKv();
  const storage = new KVStorage<AuthCodeEntity>(kv, "auth_code");
  return new AuthCodeRepository(storage);
}
