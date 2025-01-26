const users = [
    { email: "admin@example.com", role: "Admin" },
    { email: "viewer@example.com", role: "Viewer" },
  ];
  
  export const login = (email: string) => {
    const user = users.find((user) => user.email === email);
    return user ? { ...user, isAuthenticated: true } : null;
  };
  