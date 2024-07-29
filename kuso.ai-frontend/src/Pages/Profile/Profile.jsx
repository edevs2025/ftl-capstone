import React, { useEffect, useState } from "react";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "@clerk/clerk-react";
import {jwtDecode} from "jwt-decode"; // Remove curly braces
import { HeatMapGrid } from 'react-grid-heatmap';
import axios from "axios";
import { PieChart } from '@mui/x-charts/PieChart';
import { Line } from 'react-chartjs-2';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Profile() {
  const [userToken, setUserToken] = useState(null);
  const [decodedUserToken, setDecodedUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [technicalCount, setTechnicalCount] = useState(0);
  const [caseStudyCount, setCaseStudyCount] = useState(0);
  const [behavioralCount, setBehavioralCount] = useState(0);
  const { getToken } = useAuth();

  // Dummy data for the heatmap
  const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  const heatmapData = new Array(yLabels.length).fill(0).map(() =>
    new Array(xLabels.length).fill(0).map(() => Math.floor(Math.random() * 100))
  );

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
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
            `http://localhost:3000/user/${decodedUserToken.userId}/session`
          );
          if (response.status === 200) {
            setUserData(response.data);
            setUserSessions(response.data.sessions);
            console.log(response.data);
            // console.log(userSessions);
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

  useEffect(() => {
    const gatherData = async () => {
      if (userSessions.length > 0) {
        console.log("feedback: ",userFeedback);
        for (const session of userSessions) {
          const sessionQuestions = await Promise.all(
            session.questions.map(async (question) => {
              const response = await axios.get(
                `http://localhost:3000/questions/${question.questionId}`
              );
              return response.data;
            })
          );

          setUserQuestions((prevQuestions) => [...prevQuestions, ...sessionQuestions]);
          // setUserFeedback((prevFeedback) => [...prevFeedback, ...session.feedback]);
        }
      }
    };

    const calculatePieChartData = async () => {
      await gatherData();
      if (userData && userData.sessions) {
        // setUserSessions(userData.sessions);
        userData.sessions.forEach((session) => {
          if(session.feedback.length > 0) {  
            const feedbackk = session.feedback[0];
            setUserScores((prevScore) => [...prevScore, feedbackk.score]);
          }
          session.questions.forEach((question) => {
              if (question.question.keyword[0] === "technical") setTechnicalCount((prev) => prev + 1);
              if (question.question.keyword[0] === "behavioral") setBehavioralCount((prev) => prev + 1);
              if (question.question.keyword[0] === "case study") setCaseStudyCount((prev) => prev + 1);
            });
        });
      }
    };
    
    calculatePieChartData();
  }, [userData]);

  function formatTimeAgo(date) {
    return `${formatDistanceToNowStrict(date)} ago`;
  }
  
  const pieChartData = [
    { id: 0, value: technicalCount, label: 'Technical' },
    { id: 1, value: behavioralCount, label: 'Behavioral' },
    { id: 2, value: caseStudyCount, label: 'Case Study' },
  ];
  
  const lineChartData = {
    labels: userScores.map((_, index) => `Session ${index + 1} Score`), // Adjusted labels array
    datasets: [
      {
        label: 'Grades',
        data: userScores, 
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true,
        tension: 0.1,
      },
    ],
  };
  const lineChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Score',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Interview Performance Scores',
      },
    },
  };
  
  return (
    <div>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="left-container">
            {userData && (
              <div className="profile-info">
                <strong>
                  <span style={{display: "flex", gap:".25rem"}}>
                      <p>{userData.firstName}</p>
                      <p>{userData.lastName}</p>
                  </span>
                </strong>
                <p>{userData.username}</p>
                <p>Questions solved: <strong>10</strong></p>
                <p>Joined <strong>{formatTimeAgo(new Date(userData.createdAt))}</strong></p>
                <p>Last seen <strong>{formatTimeAgo(new Date(userData.updatedAt))}</strong></p>
              </div>
            )}
          </div>
          <div className="right-container">
            <div className="stats-container">
              <div className="stat-box">
                <h2 className="stat-title">Total Visits</h2>
                <p className="stat-value">{userSessions.length}</p>
              </div>
              <div className="stat-box">
                <h2 className="stat-title">Questions Practiced</h2>
                <p className="stat-value">{behavioralCount + technicalCount + caseStudyCount}</p>
              </div>
              <div className="stat-box">
                <h2 className="stat-title">Bounce Rate</h2>
                <p className="stat-value">40%</p>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-box pie-chart">
                <h2 className="chart-title">Question Breakdown By Topic</h2>
                <div className="chart-placeholder">
                  <PieChart
                    series={[
                      {
                        data: pieChartData,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                      },
                    ]}
                    height={200}
                    margin={{ bottom: 10, right: 120 }}
                  />
                </div>
              </div>
              <div className="chart-box">
                <h2 className="chart-title">Average Scores</h2>
                <div className="chart-placeholder">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>
            </div>

            <div className="heatmap-container">
              <h2 className="heatmap-title">Activity Breakdown</h2>
              <HeatMapGrid
                data={heatmapData}
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