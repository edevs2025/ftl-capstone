import React, {useEffect} from "react";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "@clerk/clerk-react";

const AfterSignIn = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();

      // console.log(token);
      // Send this token to your backend
      const response = await fetch(
        "http://localhost:3000/user/login",
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
        // console.log(data)
        // Store the custom JWT token from your backend
        localStorage.setItem("authToken", data.token);
        // You can also store user data or redirect to a protected route
      }
    };

    fetchToken();
  }, [getToken]);
};

function Profile() {
  AfterSignIn();
  return (
    <div>
      <Navbar />
      <h1>Profile Page</h1>
      {/* Add your profile content here */}
    </div>
  );
}

export default Profile;
