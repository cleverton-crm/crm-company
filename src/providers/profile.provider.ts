import { Profile, ProfileSchema } from 'src/schemas/profile.schema';

export const ProfileProviderSchema = {
  name: Profile.name,
  useFactory: () => {
    ProfileSchema.set('toJSON', { virtuals: true });
    ProfileSchema.set('toObject', { virtuals: true });
    return ProfileSchema;
  },
};
