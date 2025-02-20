import { verifyJWT } from "../../Infra/JWT.ts";
import { createJWT } from "../../Infra/JWT.ts";
import { AccessToken, Email, Password } from "../../Repository/type.ts";
import {
  createUserRepository,
  isUserType,
  UserRepositoryInterface,
  UserType,
} from "../../Repository/User.ts";

export type decode = (token: AccessToken) => Promise<UserType>;

interface AuthenticateRepositoryInterface {
  signin(
    email: Email,
    password: Password,
  ): Promise<AccessToken | null>;
  isAuthenticated(token: AccessToken): Promise<boolean>;
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

    return await encode(user);
  }

  async isAuthenticated(token: AccessToken): Promise<boolean> {
    const user = await decode(token);
    return !!user;
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

export async function decode(token: AccessToken): Promise<UserType | null> {
  const ret = await verifyJWT(token);
  if (!ret) {
    return null;
  }
  if (!isUserType(ret)) {
    return null;
  }
  return ret;
}
