import { createJWT } from "../Infra/JWT.ts";
import { AccessToken, Email, Password } from "./type.ts";
import { createUserRepository, UserRepositoryInterface } from "./User.ts";

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

    const accessToken = await createJWT({
      sub: user.id,
      email: user.email,
    });

    return accessToken;
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
