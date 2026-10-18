import type { Schema } from 'mongoose';

// shapes every document sent to the client: `id` instead of Mongo's `_id`, without the internal `__v` version field
export function cleanJSON(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true, // adds `id`, a string copy of `_id`
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret._id;
      return ret;
    },
  });
}
