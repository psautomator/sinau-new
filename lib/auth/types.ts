export type UserRole = 'ADMIN' | 'CONTENT_EDITOR' | 'USER';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    displayName?: string;
    permissions?: string[];
}
