import { JWTPayload } from "npm:jose";
import { StorageInterface } from "../../../Infra/KV.ts";
import { ResourceId } from "../../../Repository/type.ts";
import { StorageEntity } from "../../../Infra/KV.ts";
import { KVStorage } from "../../../Infra/KV.ts";
import { IdTokenPayload } from "../IdToken.ts";
import { Scope } from "../Validator.ts";
type AuthCode = string;

export interface AuthCodeRepositoryInterface {
  store(payload: JWTPayload, scopes: Scope[]): Promise<AuthCode>;
  findByCode(code: AuthCode): Promise<AuthCodeEntity | null>;
  generateAuthCode(): AuthCode;
}

interface AuthCodeEntity extends StorageEntity {
  id: ResourceId;
  payload: IdTokenPayload;
  scopes: Scope[];
}

class AuthCodeRepository implements AuthCodeRepositoryInterface {
  private authCodeStorage: StorageInterface<AuthCodeEntity>;
  constructor(
    authCodeStorage: StorageInterface<AuthCodeEntity>,
  ) {
    this.authCodeStorage = authCodeStorage;
  }
  async store(payload: IdTokenPayload, scopes: Scope[]): Promise<AuthCode> {
    const authCode = this.generateAuthCode();
    await this.authCodeStorage.save({
      id: authCode,
      payload,
      scopes,
    });
    return authCode;
  }
  async findByCode(code: AuthCode): Promise<AuthCodeEntity | null> {
    const auth = await this.authCodeStorage.findById(code);
    return auth;
  }
  generateAuthCode() {
    return crypto.randomUUID();
  }
}

export async function createFromKV() {
  const kv = await Deno.openKv();
  const storage = new KVStorage<AuthCodeEntity>(kv, "auth_code");
  return new AuthCodeRepository(storage);
}
