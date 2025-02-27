import { useRef } from "preact/hooks";
import { base64url } from "npm:jose";

export default function Passkey() {
  const username = useRef("");

  const handleRegister = async (event: Event) => {
    event.preventDefault();
    if (
      typeof globalThis.PublicKeyCredential === "undefined" ||
      typeof globalThis.PublicKeyCredential.isConditionalMediationAvailable ===
        "undefined"
    ) {
      alert("Your browser does not support WebAuthn");
      return;
    }
    const available = await globalThis.PublicKeyCredential
      .isConditionalMediationAvailable();

    if (!available) {
      alert("Your browser does not support WebAuthn");
      return;
    }

    const usernameVal = username.current.value;
    if (!usernameVal || typeof usernameVal !== "string") {
      alert("Please enter a username");
      return;
    }

    const options = await getAuthenticationOptions(usernameVal);

    const credential = await navigator.credentials.create({
      publicKey: options,
    });
    if (!credential) {
      alert("Failed to create credential");
      return;
    }
    const verified = await verifyAuthentication(
      credential,
      usernameVal,
    );
    if (!verified) {
      alert("Failed to verify credential");
      return;
    }
    alert("Success");
    return;
  };

  return (
    <div>
      <h1>Signin</h1>
      <label for="username">Username:</label>
      <input
        name="username"
        id="username"
        autocomplete="username webauthn"
        type="text"
        ref={username}
      />
      <button type="button" onClick={handleRegister}>Register</button>
      <button type="button" onClick={() => {}}>Authenticate</button>
    </div>
  );
}

async function getAuthenticationOptions(
  username: string,
): Promise<PublicKeyCredentialCreationOptions> {
  const options = await fetch("/api/passkey/registration/options", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
    }),
  });
  const ret = await options.json();
  return {
    ...ret,
    challenge: base64url.decode(ret.challenge),
    user: {
      ...ret.user,
      id: base64url.decode(ret.user.id),
    },
  };
}

async function verifyAuthentication(
  credential: Credential,
  username: string,
): Promise<boolean> {
  const verify = await fetch("/api/passkey/registration/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      credential,
    }),
  });
  if (!verify.ok) {
    return false;
  }
  const ret = await verify.json();
  return ret.verified;
}
