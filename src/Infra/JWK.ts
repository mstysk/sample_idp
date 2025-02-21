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
  const key = publicKey()?.replace(/\\n/g, "\n");
  console.log(key);
  return await importSPKI(
    key || "",
    algorithm,
    {
      extractable: true,
    },
  );
};
