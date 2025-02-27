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
    console.log(prefix || this.prefix, identity);
    return [prefix || this.prefix, identity];
  }

  async save(data: T, prefix?: string, key?: keyof T): Promise<T> {
    const keySelector = this.createKeySelector(
      key ? data[key] as string : data.id,
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

  async listByPrefix(prefix: string, value: string): Promise<T[]> {
    const keySelector = this.createKeySelector(value, prefix);
    const result = this.kv.list<T>({ prefix: keySelector });
    const values = [];
    for await (const { key: _key, value } of result) {
      values.push(value);
    }
    return values;
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
