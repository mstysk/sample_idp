import { assertEquals, assertThrows } from "@std/assert";
import { 
  createFromEnv
} from "../../../../../src/Modules/Idp/Repositories/Client.ts";

// Set up test environment with valid client data
Deno.env.set("CLIENTS", JSON.stringify([
  {
    id: "test-client-1",
    secret: "test-secret-1",
    redirectUris: ["http://localhost:3000/callback", "https://example.com/callback"]
  },
  {
    id: "test-client-2", 
    secret: "test-secret-2",
    redirectUris: ["https://app.example.com/auth/callback"]
  }
]));

Deno.test("ClientRepository - should create repository instance", () => {
  const repository = createFromEnv();
  
  assertEquals(typeof repository, "object");
  assertEquals(typeof repository.findById, "function");
  assertEquals(typeof repository.authenticate, "function");
});

Deno.test("ClientRepository - should find client by id", async () => {
  const repository = createFromEnv();
  
  const client = await repository.findById("test-client-1");
  
  assertEquals(client?.id, "test-client-1");
  assertEquals(client?.secret, "test-secret-1");
  assertEquals(Array.isArray(client?.redirectUris), true);
  assertEquals(client?.redirectUris.length, 2);
  assertEquals(client?.redirectUris.some((uri: URL) => uri.href === "http://localhost:3000/callback"), true);
});

Deno.test("ClientRepository - should return null for non-existent client", async () => {
  const repository = createFromEnv();
  
  const client = await repository.findById("non-existent-client");
  assertEquals(client, null);
});

Deno.test("ClientRepository - should authenticate valid client credentials", async () => {
  const repository = createFromEnv();
  
  const isAuthenticated = await repository.authenticate("test-client-1", "test-secret-1");
  assertEquals(isAuthenticated, true);
});

Deno.test("ClientRepository - should not authenticate invalid client id", async () => {
  const repository = createFromEnv();
  
  const isAuthenticated = await repository.authenticate("invalid-client", "test-secret-1");
  assertEquals(isAuthenticated, false);
});

Deno.test("ClientRepository - should not authenticate invalid client secret", async () => {
  const repository = createFromEnv();
  
  const isAuthenticated = await repository.authenticate("test-client-1", "invalid-secret");
  assertEquals(isAuthenticated, false);
});

Deno.test("ClientRepository - should not authenticate non-existent client", async () => {
  const repository = createFromEnv();
  
  const isAuthenticated = await repository.authenticate("non-existent", "any-secret");
  assertEquals(isAuthenticated, false);
});

Deno.test("ClientRepository - should handle multiple clients", async () => {
  const repository = createFromEnv();
  
  // Test first client
  const client1 = await repository.findById("test-client-1");
  assertEquals(client1?.id, "test-client-1");
  
  // Test second client
  const client2 = await repository.findById("test-client-2");
  assertEquals(client2?.id, "test-client-2");
  assertEquals(client2?.redirectUris.length, 1);
  assertEquals(client2?.redirectUris[0].href, "https://app.example.com/auth/callback");
});

Deno.test("ClientRepository - should authenticate each client with correct credentials", async () => {
  const repository = createFromEnv();
  
  // Test client 1 authentication
  const auth1 = await repository.authenticate("test-client-1", "test-secret-1");
  assertEquals(auth1, true);
  
  // Test client 2 authentication
  const auth2 = await repository.authenticate("test-client-2", "test-secret-2");
  assertEquals(auth2, true);
  
  // Test cross authentication (should fail)
  const crossAuth1 = await repository.authenticate("test-client-1", "test-secret-2");
  assertEquals(crossAuth1, false);
  
  const crossAuth2 = await repository.authenticate("test-client-2", "test-secret-1");
  assertEquals(crossAuth2, false);
});

// Removed validateClient tests as the function is not exported







Deno.test("ClientRepository - should handle empty CLIENTS environment variable", async () => {
  // Temporarily set empty CLIENTS
  const originalClients = Deno.env.get("CLIENTS");
  Deno.env.set("CLIENTS", "");
  
  const repository = createFromEnv();
  const client = await repository.findById("any-client");
  
  assertEquals(client, null);
  
  // Restore original value
  if (originalClients) {
    Deno.env.set("CLIENTS", originalClients);
  }
});

Deno.test("ClientRepository - should handle malformed JSON in CLIENTS", async () => {
  // Temporarily set malformed CLIENTS
  const originalClients = Deno.env.get("CLIENTS");
  Deno.env.set("CLIENTS", "invalid-json");
  
  // Should not throw during creation
  const repository = createFromEnv();
  const client = await repository.findById("any-client");
  
  assertEquals(client, null);
  
  // Restore original value
  if (originalClients) {
    Deno.env.set("CLIENTS", originalClients);
  }
});

Deno.test("ClientRepository - should convert redirect URIs to URL objects", async () => {
  const repository = createFromEnv();
  
  const client = await repository.findById("test-client-1");
  if (!client) throw new Error("Client not found");
  
  // Verify that redirectUris are URL objects
  assertEquals(client.redirectUris[0] instanceof URL, true);
  assertEquals(client.redirectUris[0].href, "http://localhost:3000/callback");
  assertEquals(client.redirectUris[0].protocol, "http:");
  assertEquals(client.redirectUris[0].hostname, "localhost");
  assertEquals(client.redirectUris[0].port, "3000");
});