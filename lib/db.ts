import { v4 as uuidv4 } from 'uuid';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  metadata?: Record<string, any>;
};

const profiles = new Map<string, UserProfile>();

const seed = () => {
  const id = 'user-123';
  profiles.set(id, {
    id,
    email: 'user@example.com',
    name: 'Local User',
    createdAt: new Date().toISOString(),
    metadata: { role: 'candidate' }
  });
};
seed();

export const DB = {
  getUserProfile: async (id: string): Promise<UserProfile | null> => {
    return profiles.get(id) ?? null;
  },
  putUserProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const id = profile.id ?? `user-${uuidv4()}`;
    const record: UserProfile = {
      id,
      email: profile.email ?? 'unknown@example.com',
      name: profile.name ?? 'Unknown',
      createdAt: new Date().toISOString(),
      metadata: profile.metadata ?? {}
    };
    profiles.set(id, record);
    return record;
  }
};
