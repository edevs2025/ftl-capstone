import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Box, Button, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import questionsData from "../QuestionBank/questionData.json";
import Navbar from "../../components/Navbar/Navbar";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { useAuthContext } from "../../AuthContext";
import AiEffect from "../Landing/AiEffect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import "./mockAI.css";
import axios from "axios";

function MockAI() {
  const { id } = useParams();
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [grades, setGrades] = useState(null);
  const [sessionIsStarted, setSessionIsStarted] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [sessionQ, setSessionQ] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionQuestion, setSessionQuestion] = useState(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const recognitionRef = useRef(null);
  const { authToken, isSignedIn, userId } = useAuthContext();
  const [audioContext, setAudioContext] = useState(null);
  const [audioSources, setAudioSources] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const interviewers = [
    {
      name: "Shimmer",
      voice: "shimmer",
      image:
        "https://www.figma.com/component/e87ba508dce6fb02cc4d09de9fd21bac096663e6/thumbnail?ver=52767%3A24214&fuid=1228001826103345040",
    },
    {
      name: "Echo",
      voice: "echo",
      image:
        "https://s3-alpha.figma.com/checkpoints/T7L/thp/HrUl6sYUAMJxLJdw/52767_23922.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQ4GOSFWCVDFANMME%2F20240728%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240728T120000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=81a3fd438d5561b8ff4053ea1e10ca1f5028e28a7316db68b81292d2415f5e3e",
    },
    {
      name: "Onyx",
      voice: "onyx",
      image:
        "https://www.figma.com/component/26fc6dc8630017f4cc236c31b4662626533cf919/thumbnail?ver=52767%3A24210&fuid=1228001826103345040",
    },
    {
      name: "Fable",
      voice: "fable",
      image:
        "https://www.figma.com/component/252fc33c0305364520a23f439789194c70172416/thumbnail?ver=52767%3A24221&fuid=1228001826103345040",
    },
    {
      name: "Alloy",
      voice: "alloy",
      image:
        "https://www.figma.com/component/59ec62c78c561af2a25fb4ea1e9834cab431859a/thumbnail?ver=52767%3A24225&fuid=1228001826103345040",
    },
    {
      name: "Nova",
      voice: "nova",
      image:
        "https://www.figma.com/component/ed4dd15c23f84f0bbb4e56d0bd63887508ea7386/thumbnail?ver=52767%3A24219&fuid=1228001826103345040",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (isSignedIn && userId) {
        try {
          const sessionResponse = await axios.get(
            `https://ftl-capstone.onrender.com/user/${userId}`
          );
          setUserData(sessionResponse.data);
        } catch (error) {
          console.error("Error fetching session data:", error);
        }
      }
    };

    fetchUserData();
  }, [isSignedIn, userId, id]);

  useEffect(() => {
    if (userId) {
      getSessionData();
    }
  }, [userId]);

  const getSessionData = async () => {
    try {
      const sessionResponse = await axios.post(
        `https://ftl-capstone.onrender.com/session`,
        { userId }
      );
      const session = sessionResponse.data;

      const sessionQResponse = await axios.post(
        `https://ftl-capstone.onrender.com/questions/${id}/session`,
        {
          sessionId: session.sessionId,
          isGenerated: false,
        }
      );

      const sessionQData = sessionQResponse.data;
      setSessionQ(sessionQData);
      setSessionQuestion(sessionQData.question.questionContent);
      console.log(sessionQuestion);

      const randomInterviewer =
        interviewers[Math.floor(Math.random() * interviewers.length)];
      setSelectedInterviewer(randomInterviewer);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const toggleSessionStatus = async () => {
    const newSessionStatus = !sessionIsStarted;
    setSessionIsStarted(newSessionStatus);
    try {
      const introductionText = `Hello, ${userData.firstName}, I hope you're doing well, I'm your interviewer for today. Here's your question:`;
      const fullText = `${introductionText} ${sessionQuestion}`;

      setIsAISpeaking(true);
      await speakFeedback(fullText);
      setIsAISpeaking(false);
    } catch (error) {
      console.error("Error creating session or session question:", error);
      setIsAISpeaking(false);
    }
  };

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Browser does not support the Web Speech API");
      return;
    }

    recognitionRef.current = new webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript((prevTranscript) => {
        const lastFinalIndex = prevTranscript.lastIndexOf(finalTranscript);
        if (lastFinalIndex !== -1) {
          return prevTranscript.substring(0, lastFinalIndex);
        }
        return prevTranscript + finalTranscript + interimTranscript;
      });
    };
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognitionRef.current.onend = () => {
      setRecording(false);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioSources.forEach((source) => {
          if (source.stop) {
            source.stop();
          }
        });
        audioContext.close();
      }
    };
  }, [audioContext, audioSources]);

  const startRecording = () => {
    setRecording(true);
    setTranscript("");
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    recognitionRef.current.stop();
  };

  const fetchTTS = async (text) => {
    const API_KEY = apiKey;

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1-hd",
          input: text,
          voice: selectedInterviewer.voice,
        }),
      });

      if (!response.ok) {
        throw new Error("TTS API request failed");
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("Error fetching TTS:", error);
    }
  };

  const speakFeedback = async (feedback, speedFactor = 1.15) => {
    setIsAISpeaking(true);
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < feedback.length; i += chunkSize) {
      chunks.push(feedback.slice(i, i + chunkSize));
    }

    const newAudioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    setAudioContext(newAudioContext);
    const newAudioSources = [];

    for (const chunk of chunks) {
      try {
        const audioUrl = await fetchTTS(chunk);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await newAudioContext.decodeAudioData(arrayBuffer);

        const source = newAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speedFactor;
        source.connect(newAudioContext.destination);
        newAudioSources.push(source);

        await new Promise((resolve) => {
          source.onended = resolve;
          source.start();
        });
      } catch (error) {
        console.error("Error playing audio chunk:", error);
      }
    }

    setIsAISpeaking(false);
    setAudioSources(newAudioSources);
  };

  const calculateAverage = (grades) => {
    const values = Object.values(grades);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = sum / values.length;
    return average;
  };

  const fetchAIResponse = async (prompt) => {
    const API_KEY = apiKey;
    const fullPrompt = `You are an interviewer interviewing ${userData.firstName}. The following is the question: "${sessionQuestion}". The candidate's response is: "${prompt}". Please provide feedback and respond in 2nd person. and also return the grades in the following categories: Relevance, Clarity, Problem-Solving from 0.0 to 5.0. The response should be in the following JSON format: { "feedback": "<your feedback here>", "grades": { "Relevance": <grade>, "Clarity": <grade>, "Problem-Solving": <grade> } }`;

    try {
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an interviewer conducting a behavioral interview.",
            },
            { role: "user", content: fullPrompt },
          ],
          max_tokens: 500,
        }),
      });

      if (!result.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await result.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const responseContent = data.choices[0].message.content;

        const parsedResponse = JSON.parse(responseContent);
        const feedback = parsedResponse.feedback;
        const grades = parsedResponse.grades;

        setGrades({
          problemSolving: grades["Problem-Solving"] || 0,
          relevance: grades["Relevance"] || 0,
          clarity: grades["Clarity"] || 0,
        });

        const avgGrade = calculateAverage(grades);
        const roundedAverageGrade = parseFloat(avgGrade.toFixed(2));

        let dBFeedback = await axios.post(
          `https://ftl-capstone.onrender.com/feedback`,
          {
            score: roundedAverageGrade,
            gptResponse: feedback,
            userAnswer: prompt,
            sessionId: sessionQ.sessionId,
            sessionQuestionId: sessionQ.sessionQuestionId,
          }
        );

        setIsFeedbackExpanded(true);
        speakFeedback(feedback, 1.15);
        simulateRealTimeResponse(feedback);
      } else {
        setResponse("No message found in the AI response.");
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      setResponse("An error occurred while fetching the response.");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateRealTimeResponse = (feedback) => {
    return new Promise((resolve) => {
      const words = feedback.split(" ");
      let currentIndex = 0;
      const chunks = [];

      const simulateTyping = () => {
        if (currentIndex < words.length) {
          const chunk = words.slice(currentIndex, currentIndex + 5).join(" ");
          setResponse((prev) => prev + " " + chunk);
          chunks.push(chunk);
          currentIndex += 5;
          setTimeout(simulateTyping, 200);
        } else {
          resolve(chunks);
        }
      };

      simulateTyping();
    });
  };

  const handleSubmit = () => {
    setIsLoading(true);
    fetchAIResponse(transcript);
    setIsSubmitted(true);
  };

  const barColors = [
    "rgba(255, 99, 132, 0.6)", // Red
    "rgba(54, 162, 235, 0.6)", // Blue
    "rgba(255, 206, 86, 0.6)", // Yellow
    "rgba(75, 192, 192, 0.6)", // Green
    "rgba(153, 102, 255, 0.6)", // Purple
    "rgba(255, 159, 64, 0.6)", // Orange
  ];

  const data = {
    labels: ["Problem-Solving", "Relevance", "Clarity"],
    datasets: [
      {
        label: "Grades",
        data: grades
          ? [grades.problemSolving, grades.relevance, grades.clarity]
          : [0, 0, 0],
        backgroundColor: barColors.slice(0, 3), // Use the first 3 colors
        borderColor: barColors
          .slice(0, 3)
          .map((color) => color.replace("0.6", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return value.toFixed(1);
          },
          color: "white", // Set y-axis text color to white
        },
        title: {
          display: true,
          text: "Score",
          color: "white", // Set y-axis title color to white
        },
      },
      x: {
        ticks: {
          color: "white", // Set x-axis text color to white
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Interview Performance Scores",
        color: "white", // Set chart title color to white
      },
    },
  };

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
          zIndex: -1, // Ensure AiEffect is in the background
        }}
      >
        <AiEffect />
      </Box>
      {!sessionIsStarted ? (
        <>
          <div className="pre-mockai-container">
            <h1 style={{ color: "white", marginBottom: "5rem" }}>
              {sessionQuestion}
            </h1>
            <div className="pre-mockai-content">
              <Stack direction="row" spacing={2}>
                <Avatar
                  alt="Interviewer"
                  src={selectedInterviewer ? selectedInterviewer.image : ""}
                  sx={{
                    width: "200px",
                    height: "200px",
                    fontSize: "10rem",
                    margin: "0 auto",
                  }}
                  className={isAISpeaking ? "avatar-speaking" : ""}
                />
              </Stack>
              <p style={{ fontSize: "2rem" }}>
                {selectedInterviewer ? selectedInterviewer.name : ""}
              </p>
              <Button
                className="start-session-button"
                onClick={toggleSessionStatus}
                sx={{ color: "black ", backgroundColor: "white" }}
              >
                Start Session
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="mockai-container">
          <div className="ai-content">
            <Stack
              direction="column"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              spacing={2}
            >
              <h1 style={{ marginBottom: "5rem" }}>{sessionQuestion}</h1>

              <Avatar
                alt="Interviewer"
                src={selectedInterviewer ? selectedInterviewer.image : ""}
                sx={{
                  width: "400px",
                  height: "400px",
                  fontSize: "10rem",
                  margin: "0 auto",
                }}
                className={isAISpeaking ? "avatar-speaking" : ""}
              />
            </Stack>
            <Button
              variant="contained"
              onClick={startRecording}
              disabled={recording || isSubmitted}
              sx={{ mr: 2 }}
            >
              Start Recording
            </Button>
            <Button
              variant="contained"
              onClick={stopRecording}
              disabled={!recording}
              sx={{ mr: 2, color: "white" }}
            >
              Stop Recording
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={recording || !transcript || isSubmitted}
              sx={{ mr: 2, color: "white" }}
            >
              {isLoading ? "Thinking..." : "Submit"}
            </Button>
          </div>
          <div
            className={`ai-feedback ${isFeedbackExpanded ? "expanded" : ""}`}
          >
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  mb: 2,
                  backgroundColor: "inherit",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Link
                  to="/question-bank"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {" "}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    <ArrowBackIosIcon fontSize="small" />
                    <Typography sx={{ fontSize: "medium" }}>
                      All Questions
                    </Typography>
                  </Typography>
                </Link>
                <Typography variant="h6" sx={{ mt: 4 }}></Typography>
                <Typography sx={{ fontSize: "2rem" }}>
                  {sessionQuestion}
                </Typography>
              </Box>

              <Box sx={{ mt: 6, width: "100%", margin: "0 auto" }}>
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                  Transcript:
                </Typography>
                <Typography>{transcript}</Typography>
              </Box>
              <Box sx={{ mt: 2, width: "100%" }}>
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                  AI Response:
                </Typography>
                <ReactMarkdown>{response}</ReactMarkdown>
              </Box>
              {grades && (
                <Box
                  sx={{
                    width: "600px",
                    margin: "0 auto",
                    marginTop: "4rem",
                    color: "white",
                  }}
                >
                  <Typography variant="h6">Grades:</Typography>
                  <Bar data={data} options={options} sx={{ color: "white " }} />
                </Box>
              )}
            </Box>
          </div>
        </div>
      )}
    </>
  );
}

export default MockAI;
