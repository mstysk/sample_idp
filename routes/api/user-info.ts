import { FreshContext } from "$fresh/server.ts";
import { pickupClaims } from "../../src/Modules/Idp/IdToken.ts";
import { create } from "../../src/Modules/Idp/Repositories/AccessToken.ts";
import { createUserRepository } from "../../src/Repository/User.ts";

export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(null, {
      status: 401,
    });
  }
  const bearer = authHeader.split(" ")[1];
  const accessTokenRepository = await create();

  const accessTokenEntity = await accessTokenRepository.findById(bearer);
  if (!accessTokenEntity) {
    return new Response(null, {
      status: 401,
    });
  }
  const userRepository = await createUserRepository();
  const userProfile = await userRepository.findById(accessTokenEntity.userId);

  if (!userProfile) {
    return new Response(null, {
      status: 401,
    });
  }

  const responseUser = {
    id: userProfile.id,
    ...pickupClaims(userProfile, accessTokenEntity.scopes),
  };

  return new Response(JSON.stringify(responseUser), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
