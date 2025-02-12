import {
  AccessToken,
  AuthTokens,
  Email,
  Password,
  RefreshToken,
} from "./type.ts";
import { createUserRepository, UserRepositoryInterface } from "./User.ts";

interface AuthenticateRepositoryInterface {
  signin(
    email: Email,
    password: Password,
  ): Promise<AuthTokens | null>;
  logout(token: AccessToken): Promise<void>;
  refresh(refreshToken: RefreshToken): Promise<AuthTokens | null>;
}

class AuthenticateRepository implements AuthenticateRepositoryInterface {
  private userRepository: UserRepositoryInterface;

  constructor(
    userRepository: UserRepositoryInterface,
  ) {
    this.userRepository = userRepository;
  }
  async signin(email: Email, password: Password): Promise<AuthTokens | null> {
    console.log(email, password);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    if (!(await this.userRepository.verifyPassword(user.id, password))) {
      return null;
    }
    return { accessToken: "dummy", refreshToken: "dummy" };
  }

  logout(token: AccessToken): Promise<void> {
    throw new Error("Method not implemented.");
  }
  refresh(refreshToken: RefreshToken): Promise<AuthTokens | null> {
    throw new Error("Method not implemented.");
  }
}

export async function createAuthenticateRepository(
  userRepository = null,
): Promise<AuthenticateRepositoryInterface> {
  return new AuthenticateRepository(
    userRepository || await createUserRepository(),
  );
}
