import { z } from 'zod';

// a MongoDB id is 24 hexadecimal characters; anything else can't point to a real document
export function objectId(message: string) {
  return z.string({ error: message }).regex(/^[a-f\d]{24}$/i, message);
}

// for URL filters: ?category= (left empty) means "no filter", the same as leaving it out
export function optionalFilter<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema.optional());
}
