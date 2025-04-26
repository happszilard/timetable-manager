export type UserType = 0 | 1;

export interface User {
    userNumID: number;
    userID: string;
    firstName: string;
    lastName: string;
    username: string;
    userType: UserType;
    allowed: number;
}