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
  close(): void;
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

  close(): void {
    this.userRepository.close();
  }
}

export async function createAuthenticateRepository(
  userRepository?: UserRepositoryInterface | null,
): Promise<AuthenticateRepositoryInterface> {
  return new AuthenticateRepository(
    userRepository || await createUserRepository(),
  );
}

export async function encode(user: UserType): Promise<AccessToken> {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.displayName,
    picture: user.avatarUrl,
  };
  return await createJWT(payload) as AccessToken;
}

export async function decode(token: AccessToken): Promise<UserType | null> {
  const payload = await verifyJWT(token);
  if (!payload) {
    return null;
  }

  // Check if payload has required fields for UserType
  if (!payload.sub || !payload.email || !payload.name) {
    return null;
  }

  // Reconstruct UserType from JWT payload
  const user = {
    id: payload.sub as string,
    userId: payload.sub as string,
    email: payload.email as string,
    displayName: payload.name as string,
    avatarUrl: (payload.picture as string) || "",
    createdAt: new Date(), // This will be a new date, but it's needed for UserType
  };

  return user;
}
