export interface RegisteredUser {
  email: string;
  password: string;
  displayName: string;
  createdAt: string;
}

const STORAGE_KEY = 'infynux_registered_users';

export const getRegisteredUsers = (): RegisteredUser[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRegisteredUser = (user: {
  email: string;
  password: string;
  displayName: string;
}): void => {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const cleanEmail = user.email.toLowerCase().trim();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    const newUser: RegisteredUser = {
      email: cleanEmail,
      password: user.password,
      displayName: user.displayName.trim() || cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered user:', e);
  }
};

export const findRegisteredUser = (email: string): RegisteredUser | undefined => {
  const users = getRegisteredUsers();
  const cleanEmail = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase() === cleanEmail);
};

export const verifyRegisteredUser = (email: string, password: string): RegisteredUser | null => {
  const user = findRegisteredUser(email);
  if (!user) return null;
  if (user.password === password) return user;
  return null;
};
