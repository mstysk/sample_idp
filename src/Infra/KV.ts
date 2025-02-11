export interface StorageEntity {
  id: string;
  [key: string]: unknown;
}

export interface StorageInterface<T extends StorageEntity> {
  save(data: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<void>;
  findById(id: string): Promise<T | null>;
  findByKey(key: string, value: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}

export class KVStorage<T extends StorageEntity> implements StorageInterface<T> {
  private kv: Deno.Kv;
  private prefix: string;

  constructor(kv: Deno.Kv, prefix: string) {
    this.kv = kv;
    this.prefix = prefix;
  }

  private createKeySelector(id: string): string[] {
    return [this.prefix, id];
  }

  async save(data: T) {
    const keySelector = this.createKeySelector(data.id);
    await this.kv.set(keySelector, data);
    return data;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const keySelector = this.createKeySelector(id);
    await this.kv.set(keySelector, data);
    return;
  }

  async findById(id: string): Promise<T | null> {
    const keySelector = this.createKeySelector(id);
    const result = await this.kv.get<T>(keySelector);
    return result.value;
  }

  async findByKey(key: string, value: string): Promise<T | null> {
    const result = await this.kv.get<T>([this.prefix, key, value]);
    return result.value;
  }

  async delete(id: string): Promise<void> {
    const keySelector = this.createKeySelector(id);
    await this.kv.delete(keySelector);
    return;
  }

  static async create<T extends StorageEntity>(
    prefix: string,
  ): Promise<KVStorage<T>> {
    const kv = await Deno.openKv();
    return new KVStorage(kv, prefix);
  }
}
