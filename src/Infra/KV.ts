export interface StorageEntity {
  id: string;
  [key: string]: unknown;
}

export interface StorageInterface<T extends StorageEntity> {
  save(data: T, prefix?: string, key?: string): Promise<T>;
  update(id: string, data: Partial<T>): Promise<void>;
  findById(id: string): Promise<T | null>;
  findByPrefix(prefix: string, value: string): Promise<T | null>;
  listByPrefix(prefix: string, value: string): Promise<T[]>;
  delete(id: string): Promise<void>;
}

export class KVStorage<T extends StorageEntity> implements StorageInterface<T> {
  private kv: Deno.Kv;
  private prefix: string;

  constructor(kv: Deno.Kv, prefix: string) {
    this.kv = kv;
    this.prefix = prefix;
  }

  private createKeySelector(identity: string, prefix?: string): string[] {
    const selector = [prefix || this.prefix, identity];
    console.log(selector);
    return selector;
  }

  async save(data: T, prefix?: string, key?: keyof T): Promise<T> {
    const keySelector = this.createKeySelector(
      key ? (data[key] || key) as string : data.id,
      prefix,
    );
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

  async findByPrefix(
    prefix: string,
    value: string,
  ): Promise<T | null> {
    const keySelector = this.createKeySelector(value, prefix);
    const result = await this.kv.get<T>(keySelector);
    return result.value;
  }

  async listByPrefix(prefix: string, condition: string): Promise<T[]> {
    const iter = this.kv.list<T>({ prefix: [prefix] });
    const result: T[] = [];
    for await (const { key, value } of iter) {
      const userKey = key[1] as string;
      if (!userKey.startsWith(condition)) {
        continue;
      }
      result.push(value);
    }
    return result;
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
