import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { SignedOut, SignedIn, UserButton, useAuth } from "@clerk/clerk-react";

const Navbar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

      setPrevScrollPos(currentScrollPos);

      if (visible !== prevVisible) {
        if (!visible) {
          setTimeout(() => setVisible(visible), 300);
        } else {
          setVisible(visible);
        }
      }
    };

    let prevVisible = visible;

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);

  const handleProtectedLink = (path) => {
    if (!isSignedIn) {
      navigate('/signin');
    } else {
      navigate(path);
    }
  };

  return (
    <nav className={`navbar-container ${visible ? "" : "navbar-hidden"}`}>
      <Link to="/">
        <div className="navbar-logo">
          <h1>muso.ai</h1>
        </div>
      </Link>
      <div className="navbar-middle-content">
        <Link to="/question-bank">questions</Link>
        <span className="navbar-link" onClick={() => handleProtectedLink('/conversational-ai')} style={{cursor: 'pointer'}}>conversation</span>
        <span className="navbar-link" onClick={() => handleProtectedLink('/profile')} style={{cursor: 'pointer'}}>profile</span>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <span>
          <Link to="/signup" className="navbar-signup">signup<span> </span></Link>
          /
          <Link to="/signin" className="navbar-signup"><span> </span>signin</Link>
        </span>
      </SignedOut>
    </nav>
  );
};

export default Navbar;
