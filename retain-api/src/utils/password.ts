import bcrypt from 'bcryptjs';

// cost 10 = 2^10 hashing rounds: fast enough for a login, slow enough to make guessing passwords expensive
const ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
