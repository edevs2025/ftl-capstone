import React, { useEffect, useState } from "react";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {jwtDecode} from "jwt-decode"; // Remove curly braces
import axios from "axios";
import { PieChart } from '@mui/x-charts/PieChart';
import { Line } from 'react-chartjs-2';
import Modal from "./Modal";
import { formatDistanceToNowStrict, set } from 'date-fns';
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
  const [overallScore, setOverallScore] = useState(0);
  const [userQuestions, setUserQuestions] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [totalVisits, setTotalVisits] = useState(1);
  const [userFeedback, setUserFeedback] = useState([]);
  const [sessionNumber, setSessionNumber] = useState(0);
  const [userScores, setUserScores] = useState([]);
  const [technicalCount, setTechnicalCount] = useState(0);
  const [caseStudyCount, setCaseStudyCount] = useState(0);
  const [behavioralCount, setBehavioralCount] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const navigate = useNavigate();
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
      setTotalVisits(0);
      if (decodedUserToken && decodedUserToken.userId) {
        try {
          const response = await axios.get(
            `https://ftl-capstone.onrender.com/user/${decodedUserToken.userId}/session`
          );
          if (response.status === 200) {
            setUserData(response.data);
            setUserQuestions(response.data.questions);
            setUserSessions(response.data.sessions);
            setTotalVisits(response.data.sessions.length);
            console.log(response.data);
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
    setTechnicalCount(0);
    setBehavioralCount(0);
    setCaseStudyCount(0);
    setUserScores([]);
      const calculatePieChartData = async () => {
    if (userData && userData.sessions) {
      let totalScore = 0;
      let scoreCount = 0;

      userData.sessions.forEach((session) => {
        if (session.feedback.length > 0) {
          const feedback = session.feedback[0];
          setUserScores((prevScores) => [...prevScores, feedback.score]);
          totalScore += feedback.score;
          scoreCount += 1;
        }

        session.questions.forEach((question) => {
          if (question.question.keyword[0] === "technical") setTechnicalCount((prev) => prev + 1);
          if (question.question.keyword[0] === "behavioral") setBehavioralCount((prev) => prev + 1);
          if (question.question.keyword[0] === "case study") setCaseStudyCount((prev) => prev + 1);
        });
      });

      if (scoreCount > 0) {
        setOverallScore(totalScore / scoreCount); // Calculate the average score
      }
    }
  };

  calculatePieChartData();
}, [userData]);

  function formatTimeAgo(date) {
    return `${formatDistanceToNowStrict(date)} ago`;
  }

  const handleOnClick = (questionId) => {
    navigate(`/mockai/${questionId}`);
  };

  const handleOnClickSession = (session, index) => {
    setCurrentSession(session);
    setSessionNumber(index);
  };

  const pieChartData = [
    { id: 0, value: technicalCount, label: 'Technical' },
    { id: 1, value: behavioralCount, label: 'Behavioral' },
    { id: 2, value: caseStudyCount, label: 'Case Study' },
  ];

  const lineChartData = {
    labels: userScores.map((_, index) => `Session ${index + 1} Score`),
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
                  <span style={{ display: "flex", gap: ".25rem" }}>
                    <p>{userData.firstName}</p>
                    <p>{userData.lastName}</p>
                  </span>
                </strong>
                <p>Username: {userData.username}</p>
                <p>Joined <strong>{formatTimeAgo(new Date(userData.createdAt))}</strong></p>
                <p>Last seen <strong>{formatTimeAgo(new Date(userSessions[userSessions.length - 1].createdAt))}</strong></p>
              </div>
            )}
            <div className="bookmarked-questions">
              <h3>Bookmarked Questions</h3>
              {userQuestions.map((question, index) => (
                <div
                  key={index}
                  className="questions"
                  onClick={() => handleOnClick(question.questionId)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <p>{question.questionContent}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="right-container">
            <div className="stats-container">
              <div className="stat-box">
                <h2 className="stat-title">Total Pratice Sessions</h2>
                <p className="stat-value">{totalVisits}</p>
              </div>
              <div className="stat-box">
                <h2 className="stat-title">Questions Practiced</h2>
                <p className="stat-value">{behavioralCount + technicalCount + caseStudyCount}</p>
              </div>
              <div className="stat-box">
                <h2 className="stat-title">Overall Average Score</h2>
                <p className="stat-value">{Math.round(overallScore * 1000) / 1000}</p>
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

            <div className="sessions-container">
              <h2 className="sessions-title">Past Sessions</h2>
              {userSessions.length > 0 ? (
    userSessions.map((session, index) => (
      <div
        key={index}
        className="sessions"
        onClick={() => handleOnClickSession(session, (index + 1))}
        style={{ cursor: "pointer", position: "relative" }}
      >
        <p>Session {index + 1}</p>
        <p>Date: {session.createdAt.substring(0, 10)}</p>
      </div>
    ))
  ) : (
    <p>No sessions available.</p>
  )}
  {currentSession && (
  <Modal show={currentSession !== null} onClose={() => setCurrentSession(null)}>
  <h2 style={{ color: "white" }}>Session {sessionNumber}</h2>
  {currentSession.questions.length > 0 ? (
    currentSession.questions.map((question, index) => (
      <div
        key={index}
        className="sessionModal"
        style={{ color: "white" }}
      >
        <h3>Question: {question.question.questionContent}</h3>
        {question.feedback && question.feedback.length > 0 ? (
          <>
            <h3>Your Answer: {question.feedback[0].userAnswer}</h3>
            <h3>Score: {question.feedback[0].score}</h3>
            <h3>Answer Evaluation: {question.feedback[0].gptResponse}</h3>
          </>
        ) : (
          <p>No feedback available for this question.</p>
        )}
      </div>
    ))
  ) : (
    <p style={{ color: "white" }}>No questions available for this session.</p>
  )}
  
</Modal>


)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;





