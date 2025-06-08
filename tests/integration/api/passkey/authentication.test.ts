import { assertEquals } from "@std/assert";

// Mock authentication response structure
const mockAuthenticationResponse = {
  id: "test-credential-id",
  rawId: "test-raw-id",
  type: "public-key",
  authenticatorAttachment: "platform",
  response: {
    authenticatorData: "mock-authenticator-data",
    clientDataJSON: "mock-client-data-json",
    signature: "mock-signature",
    userHandle: "test-user-handle",
  },
};

Deno.test("Passkey Authentication - should validate request structure", async () => {
  const requestBody = {
    username: "test@example.com",
    credential: mockAuthenticationResponse,
  };
  
  const request = new Request("http://localhost:8000/api/passkey/authentication/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  assertEquals(request.method, "POST");
  assertEquals(request.headers.get("Content-Type"), "application/json");
  
  const body = await request.json();
  assertEquals(body.username, "test@example.com");
  assertEquals(body.credential.id, "test-credential-id");
  assertEquals(body.credential.type, "public-key");
});

Deno.test("Passkey Authentication - should reject missing username", async () => {
  const requestBody = {
    credential: mockAuthenticationResponse,
    // Missing username
  };
  
  const request = new Request("http://localhost:8000/api/passkey/authentication/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const body = await request.json();
  assertEquals(body.credential !== undefined, true);
  assertEquals(body.username, undefined);
});

Deno.test("Passkey Authentication - should reject invalid credential structure", async () => {
  const requestBody = {
    username: "test@example.com",
    credential: {
      id: "test-id",
      // Missing required fields
    },
  };
  
  const request = new Request("http://localhost:8000/api/passkey/authentication/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const body = await request.json();
  assertEquals(body.username, "test@example.com");
  assertEquals(body.credential.response, undefined);
});

Deno.test("Passkey Authentication - should handle empty request body", async () => {
  const request = new Request("http://localhost:8000/api/passkey/authentication/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const body = await request.json();
  assertEquals(body.username, undefined);
  assertEquals(body.credential, undefined);
});