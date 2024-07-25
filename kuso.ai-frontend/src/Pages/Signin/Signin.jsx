import {React, useEffect} from "react";
import "./Signin.css";
import Navbar from "../../components/Navbar/Navbar";
import { SignUp, SignIn} from "@clerk/clerk-react";


function Signup() {
  
  return (
    <>
      <Navbar />
      <div className="signin-container">
        <SignIn forceRedirectUrl="/profile" />
      </div>
    </>
  );
}

export default Signup;