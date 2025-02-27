import { KVStorage, StorageEntity, StorageInterface } from "../Infra/KV.ts";

interface Passkey extends StorageEntity {
  id: string;
  userId: string;
  publicKey: string;
  algorithm: string;
  transports: string[];
}

interface PasskeyRepositoryInterface {
  findById(id: string): Promise<Passkey | null>;
  findByUserId(userId: string): Promise<Passkey[]>;
  save(data: Passkey): Promise<void>;
  delete(id: string): Promise<void>;
}

class PasskeyRepository implements PasskeyRepositoryInterface {
  private storage: StorageInterface<Passkey>;

  private userIdKey = "passkey_by_userId" as const;

  constructor(storage: StorageInterface<Passkey>) {
    this.storage = storage;
  }
  async findById(id: string): Promise<Passkey | null> {
    return await this.storage.findById(id);
  }
  async findByUserId(userId: string): Promise<Passkey[]> {
    return await this.storage.listByPrefix(this.userIdKey, userId);
  }
  async save(data: Passkey): Promise<void> {
    await this.storage.save(data);
    await this.storage.save(data, this.userIdKey, data.userId);
  }
  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
  }
}

export async function create(): Promise<PasskeyRepositoryInterface> {
  return new PasskeyRepository(
    await KVStorage.create<Passkey>("passkey"),
  );
}
