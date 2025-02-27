import { base64url } from "npm:jose";
import { KVStorage } from "../Infra/KV.ts";
import { StorageInterface } from "../Infra/KV.ts";
import { StorageEntity } from "../Infra/KV.ts";

interface Challenge extends StorageEntity {
  challenge: ChallengeBuf;
  createdAt: Date;
  expiresAt: Date;
}

type ChallengeBuf = Uint8Array;
type ChallengeStr = string;

function isChallengeStr(value: unknown): value is ChallengeStr {
  return typeof value === "string";
}

interface ChallengeRepositoryInterface {
  findById(id: string): Promise<Challenge | null>;
  save(data: Challenge): Promise<void>;
  delete(id: string): Promise<void>;
}

class ChallengeRepository implements ChallengeRepositoryInterface {
  private storage: StorageInterface<Challenge>;
  constructor(
    storage: StorageInterface<Challenge>,
  ) {
    this.storage = storage;
  }
  async findById(id: string): Promise<Challenge | null> {
    return await this.storage.findById(id);
  }
  async save(data: Challenge): Promise<void> {
    await this.storage.save(data);
  }
  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
    return;
  }
}

export async function create(): Promise<ChallengeRepositoryInterface> {
  return new ChallengeRepository(
    await KVStorage.create<Challenge>("challenge"),
  );
}

export function isExpired(challenge: Challenge): boolean {
  return challenge.expiresAt < new Date();
}

export function sameChallenge(
  challenge1: ChallengeBuf,
  challenge2: ChallengeBuf | ChallengeStr,
): boolean {
  console.log(base64url.encode(challenge1), challenge2);
  return base64url.encode(challenge1) ===
    (isChallengeStr(challenge2) ? challenge2 : base64url.encode(challenge2));
}
