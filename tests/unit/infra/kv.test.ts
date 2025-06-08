import { assertEquals } from "@std/assert";
import { KVStorage, StorageEntity } from "../../../src/Infra/KV.ts";

interface TestEntity extends StorageEntity {
  id: string;
  name: string;
  email?: string;
  value?: number;
}

interface TestUser extends StorageEntity {
  id: string;
  username: string;
  email: string;
}

Deno.test("KVStorage - should create storage instance", async () => {
  const storage = await KVStorage.create<TestEntity>("test");
  
  assertEquals(typeof storage, "object");
  assertEquals(storage instanceof KVStorage, true);
});

Deno.test("KVStorage - should save and find by id", async () => {
  const storage = await KVStorage.create<TestEntity>("test_save");
  
  const testData: TestEntity = {
    id: "test-id-1",
    name: "Test Name",
    email: "test@example.com",
  };
  
  // Save data
  const saved = await storage.save(testData);
  assertEquals(saved, testData);
  
  // Find by id
  const found = await storage.findById("test-id-1");
  assertEquals(found?.id, "test-id-1");
  assertEquals(found?.name, "Test Name");
  assertEquals(found?.email, "test@example.com");
  
  // Cleanup
  await storage.delete("test-id-1");
});

Deno.test("KVStorage - should save with custom prefix and key", async () => {
  const storage = await KVStorage.create<TestEntity>("test_custom");
  
  const testData: TestEntity = {
    id: "test-id-2",
    name: "Test User",
    email: "user@example.com",
  };
  
  // Save with custom prefix and key
  await storage.save(testData, "custom_prefix", "email");
  
  // Find by custom prefix
  const found = await storage.findByPrefix("custom_prefix", "user@example.com");
  assertEquals(found?.id, "test-id-2");
  assertEquals(found?.email, "user@example.com");
  
  // Cleanup - delete from original storage
  await storage.delete("test-id-2");
});

Deno.test("KVStorage - should update existing data", async () => {
  const storage = await KVStorage.create<TestEntity>("test_update");
  
  const testData: TestEntity = {
    id: "test-id-3",
    name: "Original Name",
    value: 100,
  };
  
  // Save original data
  await storage.save(testData);
  
  // Update data
  await storage.update("test-id-3", { name: "Updated Name", value: 200 });
  
  // Find updated data
  const found = await storage.findById("test-id-3");
  assertEquals(found?.name, "Updated Name");
  assertEquals(found?.value, 200);
  
  // Cleanup
  await storage.delete("test-id-3");
});

Deno.test("KVStorage - should return null for non-existent id", async () => {
  const storage = await KVStorage.create<TestEntity>("test_null");
  
  const found = await storage.findById("non-existent-id");
  assertEquals(found, null);
});

Deno.test("KVStorage - should return null for non-existent prefix", async () => {
  const storage = await KVStorage.create<TestEntity>("test_null_prefix");
  
  const found = await storage.findByPrefix("non_existent_prefix", "value");
  assertEquals(found, null);
});

Deno.test("KVStorage - should list by prefix with condition", async () => {
  const storage = await KVStorage.create<TestUser>("test_list");
  
  // Create test data
  const users: TestUser[] = [
    { id: "user1", username: "john_doe", email: "john@example.com" },
    { id: "user2", username: "john_smith", email: "smith@example.com" },
    { id: "user3", username: "jane_doe", email: "jane@example.com" },
  ];
  
  // Save users with custom prefix
  for (const user of users) {
    await storage.save(user, "users", "username");
  }
  
  // List users starting with "john"
  const johnUsers = await storage.listByPrefix("users", "john");
  assertEquals(johnUsers.length, 2);
  assertEquals(johnUsers.some(u => u.username === "john_doe"), true);
  assertEquals(johnUsers.some(u => u.username === "john_smith"), true);
  
  // List users starting with "jane"
  const janeUsers = await storage.listByPrefix("users", "jane");
  assertEquals(janeUsers.length, 1);
  assertEquals(janeUsers[0].username, "jane_doe");
  
  // List users starting with "bob" (should be empty)
  const bobUsers = await storage.listByPrefix("users", "bob");
  assertEquals(bobUsers.length, 0);
  
  // Cleanup
  for (const user of users) {
    await storage.delete(user.id);
  }
});

Deno.test("KVStorage - should delete data", async () => {
  const storage = await KVStorage.create<TestEntity>("test_delete");
  
  const testData: TestEntity = {
    id: "test-id-delete",
    name: "To Be Deleted",
  };
  
  // Save data
  await storage.save(testData);
  
  // Verify it exists
  let found = await storage.findById("test-id-delete");
  assertEquals(found?.id, "test-id-delete");
  
  // Delete data
  await storage.delete("test-id-delete");
  
  // Verify it's deleted
  found = await storage.findById("test-id-delete");
  assertEquals(found, null);
});

Deno.test("KVStorage - should handle save with key as keyof T", async () => {
  const storage = await KVStorage.create<TestEntity>("test_keyof");
  
  const testData: TestEntity = {
    id: "test-keyof-1",
    name: "Test",
    email: "keyof@example.com",
  };
  
  // Save using email as key
  await storage.save(testData, undefined, "email");
  
  // Should be able to find by id (default behavior)
  const found = await storage.findById("test-keyof-1");
  assertEquals(found?.email, "keyof@example.com");
  
  // Cleanup
  await storage.delete("test-keyof-1");
});

Deno.test("KVStorage - should handle complex listByPrefix scenarios", async () => {
  const storage = await KVStorage.create<TestEntity>("test_complex_list");
  
  const testData: TestEntity[] = [
    { id: "1", name: "alpha_test" },
    { id: "2", name: "alpha_prod" },
    { id: "3", name: "beta_test" },
    { id: "4", name: "gamma_test" },
  ];
  
  // Save all with prefix "env" and name as key
  for (const data of testData) {
    await storage.save(data, "env", "name");
  }
  
  // List items starting with "alpha"
  const alphaItems = await storage.listByPrefix("env", "alpha");
  assertEquals(alphaItems.length, 2);
  
  // List items starting with "beta"
  const betaItems = await storage.listByPrefix("env", "beta");
  assertEquals(betaItems.length, 1);
  assertEquals(betaItems[0].name, "beta_test");
  
  // List items starting with "delta" (non-existent)
  const deltaItems = await storage.listByPrefix("env", "delta");
  assertEquals(deltaItems.length, 0);
  
  // Cleanup
  for (const data of testData) {
    await storage.delete(data.id);
  }
});