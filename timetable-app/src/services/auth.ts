import axios from "axios";

import { User } from "../types/user";

export const login = async (username: string, password: string): Promise<User> => {
    const res = await axios.post('/auth/login', { username, password }, { withCredentials: true });
    return res.data.data;
};
  
export const fetchCurrentUser = async (): Promise<User> => {
    const res = await axios.get('/auth/me', { withCredentials: true });
    return res.data.data;
};