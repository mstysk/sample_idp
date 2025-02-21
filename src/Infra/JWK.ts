import { importSPKI } from "npm:jose";

const publicKey = (): string | null => {
  const key = Deno.env.get("JWT_PUBLIC");
  if (!key) {
    return null;
  }
  return key;
};

export const getPublicKey = async (): Promise<CryptoKey> => {
  const algorithm = "RS256";
  return await importSPKI(
    publicKey() || "",
    algorithm,
    {
      extractable: true,
    },
  );
};
