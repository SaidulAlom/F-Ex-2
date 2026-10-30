import bcrypt from 'bcryptjs';
import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

export const ROLES = ['owner', 'branchStaff'] as const;
export type Role = (typeof ROLES)[number];

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'branchStaff' },
    branch: { type: String, enum: ['lokhra', 'basistha', 'all'], default: 'all' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash on create / password change.
UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: string;
  comparePassword(candidate: string): Promise<boolean>;
};

export const User: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>('User', UserSchema);
