import { importPKCS8, importSPKI } from "npm:jose";

const publicKey = (): string | null => {
  const key = Deno.env.get("JWT_PUBLIC");
  if (!key) {
    return null;
  }
  return key;
};

const privateKey = (): string | null => {
  const key = Deno.env.get("JWT_SECRET");
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

export const getPrivateKey = async (): Promise<CryptoKey> => {
  const algorithm = "RS256";
  const pkey = privateKey()?.replace(/\\n/g, "\n");
  return await importPKCS8(pkey || "", algorithm);
};

export function getKeyId(): string {
  const ret = Deno.env.get("JWT_KEY_ID");
  if (!ret) {
    return "DefaultKeyId";
  }
  return ret;
}
