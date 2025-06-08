import { assertEquals } from "@std/assert";
import { authCheck } from "../../src/Modules/Authenticate/middleware.ts";
import { createJWT } from "../../src/Infra/JWT.ts";
import { UserType } from "../../src/Repository/User.ts";

// Set up test environment - need at least 32 bytes for HMAC-SHA256
Deno.env.set(
  "JWT_SECRET",
  "test-secret-key-for-security-tests-with-sufficient-length-32-bytes",
);

const testUser: UserType = {
  sub: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: "https://example.com/avatar.jpg",
  userId: "test-user-id",
  createdAt: new Date(),
};

Deno.test("Security - authCheck should redirect without session cookie", async () => {
  const request = new Request("http://localhost:8000/protected", {
    method: "GET",
  });

  const result = await authCheck(request);

  // Should return a Response (redirect), not UserType
  assertEquals(result instanceof Response, true);
  if (result instanceof Response) {
    assertEquals(result.status, 302);
    assertEquals(result.headers.get("Location"), "/signin");
  }
});

Deno.test("Security - authCheck should redirect with invalid session", async () => {
  const request = new Request("http://localhost:8000/protected", {
    method: "GET",
    headers: {
      "Cookie": "sess=invalid-jwt-token",
    },
  });

  const result = await authCheck(request);

  assertEquals(result instanceof Response, true);
  if (result instanceof Response) {
    assertEquals(result.status, 302);
    assertEquals(result.headers.get("Location"), "/signin");
  }
});

Deno.test("Security - authCheck should return user with valid session", async () => {
  const validToken = await createJWT(testUser);
  const request = new Request("http://localhost:8000/protected", {
    method: "GET",
    headers: {
      "Cookie": `sess=${validToken}`,
    },
  });

  const result = await authCheck(request);

  // Should return UserType, not Response
  assertEquals(result instanceof Response, false);
  if (!(result instanceof Response)) {
    assertEquals(result.id, testUser.sub);
    assertEquals(result.email, testUser.email);
  }
});

Deno.test("Security - authCheck should handle malformed cookie", async () => {
  const request = new Request("http://localhost:8000/protected", {
    method: "GET",
    headers: {
      "Cookie": "sess=", // Empty session
    },
  });

  const result = await authCheck(request);

  assertEquals(result instanceof Response, true);
  if (result instanceof Response) {
    assertEquals(result.status, 302);
  }
});

Deno.test("Security - authCheck should handle multiple cookies", async () => {
  const validToken = await createJWT(testUser);
  const request = new Request("http://localhost:8000/protected", {
    method: "GET",
    headers: {
      "Cookie": `other=value; sess=${validToken}; another=value`,
    },
  });

  const result = await authCheck(request);

  assertEquals(result instanceof Response, false);
  if (!(result instanceof Response)) {
    assertEquals(result.id, testUser.sub);
  }
});
