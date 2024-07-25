import React, { useEffect, useState } from "react";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "@clerk/clerk-react";
import { jwtDecode } from "jwt-decode";
import { HeatMapGrid } from 'react-grid-heatmap';
import axios from "axios";

function Profile() {
  const [userToken, setUserToken] = useState(null);
  const [decodedUserToken, setDecodedUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const { getToken } = useAuth();

  // Dummy data for the heatmap
  const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  const data = new Array(yLabels.length).fill(0).map(() => 
    new Array(xLabels.length).fill(0).map(() => Math.floor(Math.random() * 100))
  );


  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://localhost:3000/user/login", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

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
            `http://localhost:3000/user/${decodedUserToken.userId}`
          );
          if (response.status === 200) {
            setUserData(response.data);
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

  console.log(userData);

  return (
    <div>
      <Navbar />
    <div className="profile-page">
        
      <div className="profile-container">
        <div className="left-container">    
          {userData && (
            <div className="profile-info">
              <p>First Name: {userData.firstName}</p>
              <p>Last Name: {userData.lastName}</p>
              <p>Username: {userData.username}</p>
              <p>Email: {userData.email}</p>
            </div>
          )}
        </div>
        <div className="right-container"> 
          <div className="stats-container">
            <div className="stat-box">
              <h2 className="stat-title">Total Visits</h2>
              <p className="stat-value">1,500</p>
            </div>
            <div className="stat-box">
              <h2 className="stat-title">Questions Practiced</h2>
              <p className="stat-value">3,200</p>
            </div>
            <div className="stat-box">
              <h2 className="stat-title">Bounce Rate</h2>
              <p className="stat-value">40%</p>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-box">
              <h2 className="chart-title">Question Breakdown By Topic</h2>
              <div className="chart-placeholder">
                Line Graph Placeholder
              </div>
            </div>
            <div className="chart-box">
              <h2 className="chart-title">Average Scores</h2>
              <div className="chart-placeholder">
                Bar Graph Placeholder
              </div>
            </div>
          </div>

          <div className="heatmap-container">
            <h2 className="heatmap-title">Activity Breakdown</h2>
            <HeatMapGrid
              data={data}
              xLabels={xLabels}
              yLabels={yLabels}
              cellRender={(x, y, value) => (
                <div title={`${xLabels[x]} ${yLabels[y]}: ${value}`}>{value}</div>
              )}
              cellStyle={(x, y, ratio) => ({
                background: `rgb(12, 160, 44, ${ratio})`,
                fontSize: '11px',
                color: `rgb(0, 0, 0, ${ratio > 0.5 ? 1 : 0})`
              })}
              cellHeight="30px"
              cellWidth="40px"
              xLabelsStyle={() => ({
                fontSize: '12px',
                textTransform: 'uppercase'
              })}
              yLabelsStyle={() => ({
                fontSize: '12px',
                textTransform: 'uppercase'
              })}
            />
            </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Profile;