import {React, useEffect} from "react";
import "./Signup.css";
import Navbar from "../../components/Navbar/Navbar";
import { SignUp, } from "@clerk/clerk-react";


function Signup() {
  
  return (
    <>
      <Navbar />
      <div className="signup-container">
        <SignUp forceRedirectUrl="/question-bank" />
      </div>
    </>
  );
}

export default Signup;

{
  /* <div className="page-container">
        <div className="form-container">
          <form className="form">
            <div className="form-group">
              <label htmlFor="first-name">First Name</label>
              <input type="text" id="first-name" name="first-name" required />
              <label htmlFor="last-name">Last Name</label>
              <input type="text" id="last-name" name="last-name" required />
              <label htmlFor="email">Email</label>
              <input type="text" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="textarea">Occupation</label>
              <textarea
                name="textarea"
                id="textarea"
                rows="10"
                cols="50"
                required
              />
            </div>
            <button className="form-submit-btn" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div> */
}
