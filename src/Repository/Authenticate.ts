import { AccessToken, AuthTokens, Password, RefreshToken } from "./type.ts";

interface AuthenteicateRepositoryInterface {
  signin(
    email: string,
    password: Password,
  ): Promise<AuthTokens | null>;
  logout(token: AccessToken): Promise<void>;
  refresh(refreshToken: RefreshToken): Promise<AuthTokens | null>;
}
