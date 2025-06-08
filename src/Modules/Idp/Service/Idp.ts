import { UserType } from "../../../Repository/User.ts";
import { AuthorizationQueryParams } from "../Validator.ts";
import { AuthCodeRepositoryInterface } from "../Repositories/AuthCode.ts";
import { AccessTokenRepositoryInterface } from "../Repositories/AccessToken.ts";
import { encodeIdToken, generateIdTokenPayload } from "../IdToken.ts";
import { getKeyId } from "../../../Infra/JWK.ts";
import { BEARER_TYPE } from "../Repositories/AccessToken.ts";

export interface IdpServiceInterface {
  generateAuthorizationCode(
    user: UserType,
    params: AuthorizationQueryParams,
    issuer?: string,
  ): Promise<string>;

  exchangeCodeForTokens(
    code: string,
  ): Promise<
    {
      idToken: string;
      accessToken: string;
      tokenType: string;
      expiresIn: number;
    } | null
  >;
}

export class IdpService implements IdpServiceInterface {
  constructor(
    private authCodeRepository: AuthCodeRepositoryInterface,
    private accessTokenRepository: AccessTokenRepositoryInterface,
  ) {}

  async generateAuthorizationCode(
    user: UserType,
    params: AuthorizationQueryParams,
    issuer?: string,
  ): Promise<string> {
    const idTokenPayload = generateIdTokenPayload(user, params, issuer);
    return await this.authCodeRepository.store(idTokenPayload, params.scope);
  }

  async exchangeCodeForTokens(code: string) {
    const authCodeEntity = await this.authCodeRepository.findByCode(code);
    if (!authCodeEntity) {
      return null;
    }

    const idToken = await encodeIdToken(
      authCodeEntity.payload,
      getKeyId(),
    );

    const accessToken = await this.accessTokenRepository.save(
      authCodeEntity.payload.sub,
      authCodeEntity.scopes,
      BEARER_TYPE,
    );

    return {
      idToken,
      accessToken,
      tokenType: BEARER_TYPE,
      expiresIn: 3600,
    };
  }
}
