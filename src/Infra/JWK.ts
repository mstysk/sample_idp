import { importSPKI } from "npm:jose";

const getPublicKey = (): string | null => {
  const key = Deno.env.get("JWT_PUBLIC");
  if (!key) {
    return null;
  }
  return key;
};

const algorithm = "RS256";

export const publicKey = await importSPKI(
  getPublicKey() || "",
  algorithm,
  {
    extractable: true,
  },
);
