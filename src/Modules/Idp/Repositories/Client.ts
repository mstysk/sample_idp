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
}

export function createFromEnv(): ClientRepositoryInterface {
  const clients = Deno.env.get("CLIENTS") || "";
  return new ClientRepository(JSON.parse(clients));
}
