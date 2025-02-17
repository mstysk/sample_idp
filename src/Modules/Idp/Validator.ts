import {
  ClientRepositoryInterface,
  createFromEnv,
} from "./Repositories/Client.ts";

interface ValidaterInterface {
  validate(
    formData: FormData,
  ): Promise<AuthorizationQueryParams | QueryParamValidationError>;
}

type Scope = "openid" | "profile" | "email" | "picture";

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

type AuthorizationQueryParams = {
  scope: Scope[];
  responseType: ResponseType;
  clientId: ClientId;
  redirectUri: RedirectUri;
  state: State;
  nonce?: Nonce;
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

class Validater implements ValidaterInterface {
  private clientRepostory: ClientRepositoryInterface;

  constructor(
    clientRepostory: ClientRepositoryInterface,
  ) {
    this.clientRepostory = clientRepostory;
  }

  async validate(formData: FormData) {
    const scope = formData.get("scope");

    const scopes = scope?.toString().split(" ");
    if (typeof scopes === "undefined") {
      return new ScopeNotFound();
    }

    if (!isScope(scopes)) {
      return new ScopeOnlyOpenid();
    }

    const responseType = formData.get("response_type")?.toString();

    if (typeof responseType === "undefined") {
      return new ResponseTypeNotFound();
    }
    if (!isResponseType(responseType)) {
      return new ResponseTypeOnlyCode();
    }

    const clientId = formData.get("client_id")?.toString();

    if (typeof clientId === "undefined") {
      return new ClientIdNotFound();
    }

    const clinet = await this.clientRepostory.findById(clientId);

    if (clinet === null) {
      return new ClientNotFound();
    }

    const redirectUriByString = formData.get("redirect_uri")?.toString();

    if (typeof redirectUriByString === "undefined") {
      return new RedirectUriNotFound();
    }
    const redirectUri = new URL(redirectUriByString);
    if (clinet.redirectUris.includes(redirectUri)) {
      return new RedirectUriNotMatched();
    }

    const state = formData.get("state")?.toString();
    if (typeof state === "undefined") {
      return new StateNotFound();
    }

    const nonce = formData.get("nonce")?.toString();

    return {
      scope: scopes,
      responseType: responseType,
      clientId: clientId,
      redirectUri: redirectUri,
      state: state,
      nonce,
    };
  }
}

export function create() {
  return new Validater(createFromEnv());
}
