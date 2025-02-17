import { verifyJWT } from "../Infra/JWT.ts";
import { createJWT } from "../Infra/JWT.ts";
import { AccessToken, Email, Password } from "./type.ts";
import { isUserType, UserType } from "./User.ts";
import { createUserRepository, UserRepositoryInterface } from "./User.ts";

export type decode = (token: AccessToken) => Promise<UserType>;

interface AuthenticateRepositoryInterface {
  signin(
    email: Email,
    password: Password,
  ): Promise<AccessToken | null>;
  refresh(accessToken: AccessToken): Promise<AccessToken | null>;
}

class AuthenticateRepository implements AuthenticateRepositoryInterface {
  private userRepository: UserRepositoryInterface;

  constructor(
    userRepository: UserRepositoryInterface,
  ) {
    this.userRepository = userRepository;
  }
  async signin(email: Email, password: Password): Promise<AccessToken | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    if (!(await this.userRepository.verifyPassword(user.id, password))) {
      return null;
    }

    return await createJWT(user);
  }

  refresh(_accessToken: AccessToken): Promise<AccessToken | null> {
    throw new Error("not implemented");
  }
}

export async function createAuthenticateRepository(
  userRepository = null,
): Promise<AuthenticateRepositoryInterface> {
  return new AuthenticateRepository(
    userRepository || await createUserRepository(),
  );
}

export async function encode(user: UserType): Promise<AccessToken> {
  return await createJWT(user) as AccessToken;
}

export async function decode(token: AccessToken): Promise<UserType> {
  const ret = await verifyJWT(token);
  if (!ret) {
    throw new Error("invalid token");
  }
  if (!isUserType(ret)) {
    throw new Error("invalid token");
  }
  return ret;
}
