import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [User, setUser] = useState(null);

  useEffect(() => {
    // Try to restore user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Whenever user changes, update localStorage
  useEffect(() => {
    if (User) {
      localStorage.setItem('user', JSON.stringify(User));
    }
  }, [User]);

  return (
    <UserContext.Provider value={{ User, setUser }}>
      {children}
    </UserContext.Provider>
  );
};