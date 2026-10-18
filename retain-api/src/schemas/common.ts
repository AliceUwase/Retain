import { z } from 'zod';

// a MongoDB id is 24 hexadecimal characters; anything else can't point to a real document
export function objectId(message: string) {
  return z.string({ error: message }).regex(/^[a-f\d]{24}$/i, message);
}
