import {
  ClientRepositoryInterface,
  createFromEnv,
} from "./Repositories/Client.ts";
import {
  CODE_CHALLENGE_METHOD,
  isValidCodeChallenge,
} from "./PKCE.ts";

interface ValidaterInterface {
  validate(
    params: URLSearchParams,
  ): Promise<AuthorizationQueryParams | QueryParamValidationError>;
}

export type Scope =
  | typeof OpenIdScope
  | typeof ProfileScope
  | typeof EmailScope
  | typeof PictureScope;

export const OpenIdScope = "openid";
export const ProfileScope = "profile";
export const EmailScope = "email";
export const PictureScope = "picture";

const isScope = (list: string[]): list is Scope[] => {
  return list.every((value) => {
    return (
      value === "openid" ||
      value === "profile" ||
      value === "email" ||
      value === "picture"
    );
  });
};

type ResponseType = "code";

const isResponseType = (value: string): value is ResponseType => {
  return value === "code";
};

type ClientId = string;
type RedirectUri = URL;
type State = string;
type Nonce = string;

export type AuthorizationQueryParams = {
  scope: Scope[];
  responseType: ResponseType;
  clientId: ClientId;
  redirectUri: RedirectUri;
  state: State;
  nonce?: Nonce;
  codeChallenge?: string;
};

export const isAuthoizationQueryParams = (
  params: AuthorizationQueryParams | QueryParamValidationError,
): params is AuthorizationQueryParams => {
  return "scope" in params &&
    "responseType" in params &&
    "clientId" in params &&
    "redirectUri" in params &&
    "state" in params;
};

interface QueryParamValidationError {
  message: string;
  details: string;
}

abstract class QueryParamValidationErrorAbs
  implements QueryParamValidationError {
  abstract message: string;
  details: string = "";

  constructor(details?: string) {
    this.details = details || "";
  }

  toString() {
    return `${this.message}: ${this.details}`;
  }
}

class ScopeNotFound extends QueryParamValidationErrorAbs {
  message = "scope is invalid";
}

class ScopeOnlyOpenid extends QueryParamValidationErrorAbs {
  message = "scope is only openid";
}

class ResponseTypeNotFound extends QueryParamValidationErrorAbs {
  message = "response_type is invalid";
}

class ResponseTypeOnlyCode extends QueryParamValidationErrorAbs {
  message = "response_type is only code";
}

class ClientIdNotFound extends QueryParamValidationErrorAbs {
  message = "client_id is not found";
}

class ClientNotFound extends QueryParamValidationErrorAbs {
  message = "client is not found";
}

class RedirectUriNotFound extends QueryParamValidationErrorAbs {
  message = "redirect_uri is not found";
}

class RedirectUriNotMatched extends QueryParamValidationErrorAbs {
  message = "redirect_uri is not matched";
}

class StateNotFound extends QueryParamValidationErrorAbs {
  message = "state is not found";
}

class UnsupportedCodeChallengeMethod extends QueryParamValidationErrorAbs {
  message = "unsupported code_challenge_method";
}

class InvalidCodeChallengeFormat extends QueryParamValidationErrorAbs {
  message = "invalid code_challenge format";
}

class Validater implements ValidaterInterface {
  private clientRepostory: ClientRepositoryInterface;

  constructor(
    clientRepostory: ClientRepositoryInterface,
  ) {
    this.clientRepostory = clientRepostory;
  }

  async validate(params: URLSearchParams) {
    const scope = params.get("scope");

    const scopes = scope?.toString().split(" ");
    if (typeof scopes === "undefined") {
      return new ScopeNotFound();
    }

    if (!isScope(scopes)) {
      return new ScopeOnlyOpenid();
    }

    if (!scopes.includes("openid")) {
      return new ScopeOnlyOpenid();
    }

    const responseType = params.get("response_type")?.toString();

    if (typeof responseType === "undefined") {
      return new ResponseTypeNotFound();
    }
    if (!isResponseType(responseType)) {
      return new ResponseTypeOnlyCode();
    }

    const clientId = params.get("client_id")?.toString();

    if (typeof clientId === "undefined") {
      return new ClientIdNotFound();
    }

    const clinet = await this.clientRepostory.findById(clientId);

    if (clinet === null) {
      return new ClientNotFound();
    }

    const redirectUriByString = params.get("redirect_uri")?.toString();

    if (typeof redirectUriByString === "undefined") {
      return new RedirectUriNotFound();
    }
    const redirectUri = new URL(redirectUriByString);
    if (!clinet.redirectUris.some((uri) => uri.href === redirectUri.href)) {
      return new RedirectUriNotMatched();
    }

    const state = params.get("state")?.toString();
    if (typeof state === "undefined") {
      return new StateNotFound();
    }

    const nonce = params.get("nonce")?.toString();

    // PKCE validation (optional)
    const codeChallenge = params.get("code_challenge")?.toString();
    const codeChallengeMethod = params.get("code_challenge_method")?.toString();

    if (codeChallenge) {
      // If code_challenge is provided, code_challenge_method must be S256
      if (codeChallengeMethod && codeChallengeMethod !== CODE_CHALLENGE_METHOD) {
        return new UnsupportedCodeChallengeMethod(
          `only ${CODE_CHALLENGE_METHOD} is supported`,
        );
      }
      if (!isValidCodeChallenge(codeChallenge)) {
        return new InvalidCodeChallengeFormat();
      }
    }

    return {
      scope: scopes,
      responseType: responseType,
      clientId: clientId,
      redirectUri: redirectUri,
      state: state,
      nonce,
      codeChallenge,
    };
  }
}

export function create() {
  return new Validater(createFromEnv());
}
