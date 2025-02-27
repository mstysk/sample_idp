import { Handlers } from "$fresh/server.ts";
import PasskeyComponent from "../islands/passkey.tsx";

export const handler: Handlers = {};

export default function Passkey() {
  return (
    <>
      <h1>Passkey</h1>
      <PasskeyComponent />
    </>
  );
}
