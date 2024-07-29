import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signin.css";
import Navbar from "../../components/Navbar/Navbar";
import { SignIn } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import ModifiedParticleEffect from "../Landing/ModifiedParticleEffect";
import { useAuthContext } from "../../AuthContext"; // Make sure to import this

function Signin() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuthContext();

  useEffect(() => {
    if (isSignedIn) {
      const pendingQuestionId = localStorage.getItem('pendingQuestionId');
      console.log(pendingQuestionId)
      if (pendingQuestionId) {
        localStorage.removeItem('pendingQuestionId');
        navigate(`/mockai/${pendingQuestionId}`);
      } else {
        navigate('/profile');
      }
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      >
        <ModifiedParticleEffect />
      </Box>
      <div className="signin-container">
        <SignIn forceRedirectUrl='/signin'/>
      </div>
    </>
  );
}

export default Signin;