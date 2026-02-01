import { User } from './types';

// Placeholder for auth provider logic
export const getCurrentUser = async (): Promise<User | null> => {
    // TODO: Integrate with actual auth provider
    return null;
};

export const requireUser = async (): Promise<User> => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
};
