import React, { useEffect, useState } from "react";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "@clerk/clerk-react";
import { jwtDecode } from "jwt-decode";

import axios from "axios";

function Profile() {
  const [userToken, setUserToken] = useState(null);
  const [decodedUserToken, setDecodedUserToken] = useState(null);
  const [username, setUsername] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      try {
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
          setUserToken(data.token);
        } else {
          console.error("Failed to fetch token");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, [getToken]);

  useEffect(() => {
    if (userToken) {
      try {
        const decoded = jwtDecode(userToken);
        setDecodedUserToken(decoded);
        console.log(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [userToken]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (decodedUserToken && decodedUserToken.userId) {
        try {
          const response = await axios.get(
            `https://ftl-capstone.onrender.com/user/${decodedUserToken.userId}`
          );
          if (response.status === 200) {
            setUsername(response.data.username);
          } else {
            console.error("Failed to fetch username");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };

    fetchUsername();
  }, [decodedUserToken]);

  return (
    <div>
      <Navbar />
      <h1>Profile Page</h1>
      {decodedUserToken && (
        <div>
          <p>User ID: {decodedUserToken.userId}</p>
          <p>Username: {username}</p>
        </div>
      )}
    </div>
  );
}

export default Profile;
