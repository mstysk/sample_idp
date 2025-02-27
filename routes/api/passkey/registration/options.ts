import { FreshContext } from "$fresh/src/server/mod.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import { base64url } from "npm:jose";
import { withSetCookie } from "../../../../src/Infra/Cookies.ts";

type AuthenticatorAttachment = "platform" | "cross-platform";
type AuthenticatorUserVerification = "preferred" | "required" | "discouraged";
type Hint = "discouraged" | "preferred" | "required";
type PubKeyCredParams = {
  alg: number;
  type: string;
};

export type PublicKeyCredentialCreationOptions = {
  challenge: string;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  // @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
  pubKeyCredParams: PubKeyCredParams[];
  excludeCledentials?: [];
  authenticatorSelection: {
    authenticatorAttachment?: AuthenticatorAttachment;
    requireResidentKey: boolean;
    userVerification: AuthenticatorUserVerification;
    residentKey?: "discouraged" | "preferred" | "required";
  };
  timeout?: number;
  hints?: Hint;
  attestation?: "none" | "indirect" | "direct";
  extensions?: Record<string, unknown>;
};

const getRPName = (): string => {
  const rpName = Deno.env.get("RP_NAME");
  return rpName ? rpName : "SampleIDP";
};
export const getRPId = (): string => {
  const rpId = Deno.env.get("RP_ID");
  return rpId ? rpId : "localhost";
};

const encodeUserId = (username: string): string => {
  return base64url.encode(
    new TextEncoder().encode(getRPId() + username),
  );
};

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext): Promise<Response> {
    console.log(req);
    const formData = await req.formData();
    const username = formData.get("username");
    if (!username) {
      return new Response("Missing username", {
        status: 400,
      });
    }
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const kv = await Deno.openKv();
    await kv.set(["challenge", username.toString()], challenge);
    const options = createPublicKeyCredentialCreationOptions(
      username.toString(),
      challenge,
    );
    return new Response(JSON.stringify(options));
  },
};

function createPublicKeyCredentialCreationOptions(
  username: string,
  challenge: Uint8Array,
): PublicKeyCredentialCreationOptions {
  return {
    challenge: base64url.encode(challenge),
    rp: {
      name: getRPName(),
      //id: getRPId(),
    },
    user: {
      id: encodeUserId(username),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      {
        alg: -8,
        type: "public-key",
      },
      {
        alg: -7,
        type: "public-key",
      },
      {
        alg: -257,
        type: "public-key",
      },
    ],
    excludeCledentials: [],
    authenticatorSelection: {
      //authenticatorAttachment: "platform",
      requireResidentKey: false,
      userVerification: "preferred",
      residentKey: "preferred",
    },
    timeout: 60000,
    attestation: "none",
    extensions: {
      credProps: true,
    },
  };
}
