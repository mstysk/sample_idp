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
  const pkey = publicKey()?.replace(/\\n/g, "\n");
  return await importSPKI(
    pkey || "",
    algorithm,
    {
      extractable: true,
    },
  );
};

export function getKeyId(): string {
  const ret = Deno.env.get("JWT_KEY_ID");
  if (!ret) {
    return "DefaultKeyId";
  }
  return ret;
}
