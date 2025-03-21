// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_passkey_authentication_options from "./routes/api/passkey/authentication/options.ts";
import * as $api_passkey_authentication_signin from "./routes/api/passkey/authentication/signin.ts";
import * as $api_passkey_registration_options from "./routes/api/passkey/registration/options.ts";
import * as $api_passkey_registration_verify from "./routes/api/passkey/registration/verify.ts";
import * as $api_user_info from "./routes/api/user-info.ts";
import * as $auth_authorize from "./routes/auth/authorize.tsx";
import * as $auth_jwks from "./routes/auth/jwks.tsx";
import * as $auth_token from "./routes/auth/token.tsx";
import * as $index from "./routes/index.tsx";
import * as $logout from "./routes/logout.tsx";
import * as $passkey from "./routes/passkey.tsx";
import * as $signin from "./routes/signin.tsx";
import * as $signup from "./routes/signup.tsx";
import * as $signup_verify from "./routes/signup/verify.tsx";
import * as $passkey_1 from "./islands/passkey.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/api/joke.ts": $api_joke,
    "./routes/api/passkey/authentication/options.ts":
      $api_passkey_authentication_options,
    "./routes/api/passkey/authentication/signin.ts":
      $api_passkey_authentication_signin,
    "./routes/api/passkey/registration/options.ts":
      $api_passkey_registration_options,
    "./routes/api/passkey/registration/verify.ts":
      $api_passkey_registration_verify,
    "./routes/api/user-info.ts": $api_user_info,
    "./routes/auth/authorize.tsx": $auth_authorize,
    "./routes/auth/jwks.tsx": $auth_jwks,
    "./routes/auth/token.tsx": $auth_token,
    "./routes/index.tsx": $index,
    "./routes/logout.tsx": $logout,
    "./routes/passkey.tsx": $passkey,
    "./routes/signin.tsx": $signin,
    "./routes/signup.tsx": $signup,
    "./routes/signup/verify.tsx": $signup_verify,
  },
  islands: {
    "./islands/passkey.tsx": $passkey_1,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
