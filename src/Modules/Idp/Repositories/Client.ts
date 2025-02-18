import { StorageEntity } from "../../../Infra/KV.ts";

type ClientId = string;
type ClientSecret = string;

interface Client extends StorageEntity {
  id: ClientId;
  redirectUris: URL[];
  secret: ClientSecret;
}

export interface ClientRepositoryInterface {
  findById(id: ClientId): Promise<Client | null>;
  authenticate(id: ClientId, secret: ClientSecret): Promise<boolean>;
}

class ClientRepository implements ClientRepositoryInterface {
  private clients: Client[];
  constructor(
    clients: Client[],
  ) {
    this.clients = clients;
  }
  findById(id: ClientId): Promise<Client | null> {
    return Promise.resolve(
      this.clients.find((client) => client.id === id) || null,
    );
  }

  async authenticate(id: ClientId, secret: ClientSecret): Promise<boolean> {
    const client = await this.findById(id);
    if (!client) {
      return Promise.resolve(false);
    }
    return Promise.resolve(client.secret === secret);
  }
}

export function createFromEnv(): ClientRepositoryInterface {
  const clients = Deno.env.get("CLIENTS") || "";
  return new ClientRepository(JSON.parse(clients));
}
