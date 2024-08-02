import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        const response = await fetch(
          "https://ftl-capstone.onrender.com/user/login",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("authToken", data.token);
          setAuthToken(data.token);

          try {
            const decodedToken = jwtDecode(data.token);
            setUserId(decodedToken.userId); // Assuming the token has a userId field
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        }
      } else {
        localStorage.removeItem("authToken");
        setAuthToken(null);
        setUserId(null);
      }
    };

    fetchToken();
  }, [getToken, isSignedIn]);

  return (
    <AuthContext.Provider value={{ authToken, userId, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
