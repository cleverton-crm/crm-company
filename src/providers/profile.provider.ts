import { Profile, ProfileSchema } from 'src/schemas/profile.schema';
import { BaseProvider } from './base.provider';

export const ProfileProviderSchema = BaseProvider(Profile, ProfileSchema);
