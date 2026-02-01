import { UserRole } from './auth/types';

export const PERMISSIONS = {
    // Example permissions
    CONTENT_MANAGE: 'content_manage',
    USER_MANAGE: 'user_manage',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    ADMIN: Object.values(PERMISSIONS),
    CONTENT_EDITOR: [PERMISSIONS.CONTENT_MANAGE],
    USER: [],
};
