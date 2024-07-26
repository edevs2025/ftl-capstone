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
  const [transcript, setTranscript] = useState(
    "At my previous job, we faced a significant challenge when our main product experienced a critical bug just before an important client presentation. The bug caused the software to crash, and we had less than 24 hours to fix it. I coordinated with the development team to identify the root cause and worked overnight to implement and test the solution. We managed to resolve the issue and successfully delivered the presentation on time. This experience taught me the importance of teamwork and staying calm under pressure."
  );
  const [recording, setRecording] = useState(false);
  const [grades, setGrades] = useState(null);
  const [sessionIsStarted, setSessionIsStarted] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);
  const [initialAIResponse, setInitialAIResponse] = useState("");
  const [sessionQ, setSessionQ] = useState(null);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const recognitionRef = useRef(null);
  const { authToken, userId } = useAuthContext();

  useEffect(() => {
    const question = questionsData.questions.find(
      (q) => q.id === parseInt(id, 10)
    );

    if (question) {
      setSelectedQuestion(question.question);
    }
  }, [id]);

  const toggleSessionStatus = async () => {
    const newSessionStatus = !sessionIsStarted;
    setSessionIsStarted(newSessionStatus);
    try {
      const sessionResponse = await axios.post(
        `http://localhost:3000/session`,
        { userId }
      );
      const session = sessionResponse.data;

      const sessionQResponse = await axios.post(
        `http://localhost:3000/questions/${id}/session`,
        {
          sessionId: session.sessionId,
          isGenerated: false,
        }
      );

      const sessionQData = sessionQResponse.data;
      setSessionQ(sessionQData);

      console.log(sessionQData); // Log the correct sessionQ data after setting it
    } catch (error) {
      console.error("Error creating session or session question:", error);
    }

    // if (newSessionStatus) {
    //   const API_KEY = apiKey;
    //   const fullPrompt = `You are an interviewer. Please introduce the interviewee, whose name is John Doe, and ask him this question: "${selectedQuestion}". Format the response in the following JSON structure: {"introduction": "<your introduction>", "question": "<your question>", "prompt": "Feel free to share your response, and we can continue from there!"}`;

    //   try {
    //     const result = await fetch(
    //       "https://api.openai.com/v1/chat/completions",
    //       {
    //         method: "POST",
    //         headers: {
    //           Authorization: `Bearer ${API_KEY}`,
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           model: "gpt-4",
    //           messages: [
    //             {
    //               role: "system",
    //               content: `You are an interviewer conducting a behavioral interview.`,
    //             },
    //             { role: "user", content: fullPrompt },
    //           ],
    //           max_tokens: 500,
    //         }),
    //       }
    //     );

    //     if (!result.ok) {
    //       throw new Error("Network response was not ok");
    //     }

    //     const data = await result.json();
    //     if (data.choices && data.choices[0] && data.choices[0].message) {
    //       const responseContent = data.choices[0].message.content;
    //       console.log("Full AI Response:", responseContent);

    //       // Parse the JSON response
    //       const parsedResponse = JSON.parse(responseContent);
    //       const introduction = parsedResponse.introduction;
    //       const question = parsedResponse.question;
    //       const prompt = parsedResponse.prompt;

    //       // Combine the parsed parts into the initial AI response
    //       const initialResponse = `${introduction}\n\n${question}\n\n${prompt}`;
    //       setInitialAIResponse(initialResponse);

    //       // Integrate TTS for the initial response
    //       const audioUrl = await fetchTTS(initialResponse);
    //       const audio = new Audio(audioUrl);
    //       audio.play();
    //     } else {
    //       setResponse("No message found in the AI response.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching response:", error);
    //     setResponse("An error occurred while fetching the response.");
    //   }
    // }
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
          voice: "shimmer",
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
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < feedback.length; i += chunkSize) {
      chunks.push(feedback.slice(i, i + chunkSize));
    }

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    for (const chunk of chunks) {
      try {
        const audioUrl = await fetchTTS(chunk);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speedFactor;
        source.connect(audioContext.destination);

        await new Promise((resolve) => {
          source.onended = resolve;
          source.start();
        });
      } catch (error) {
        console.error("Error playing audio chunk:", error);
        // return
      }
    }
  };

  const calculateAverage = (grades) => {
    const values = Object.values(grades);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = sum / values.length;
    return average;
  };

  const fetchAIResponse = async (prompt) => {
    const API_KEY = apiKey;
    const fullPrompt = `You are an interviewer. The following is the question: "${selectedQuestion}". The candidate's response is: "${prompt}". Please provide feedback and respond in 2nd person. and also return the grades in the following categories: Relevance, Clarity, Problem-Solving from 0.0 to 5.0. The response should be in the following JSON format: { "feedback": "<your feedback here>", "grades": { "Relevance": <grade>, "Clarity": <grade>, "Problem-Solving": <grade> } }`;

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
        console.log("Full AI Response:", responseContent);

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

        let dBFeedback = await axios.post(`http://localhost:3000/feedback`, {
          score: roundedAverageGrade,
          gptResponse: feedback,
          userAnswer: prompt,
          sessionId: sessionQ.sessionId,
          sessionQuestionId: sessionQ.sessionQuestionId,
        });

        setTimeout(() => {
          setIsFeedbackExpanded(true);
        }, 1000);

        speakFeedback(feedback, 1.15);
        simulateRealTimeResponse(feedback);
      } else {
        setResponse("No message found in the AI response.");
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      setResponse("An error occurred while fetching the response.");
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
    fetchAIResponse(transcript);
    // add handle err if fetchairepsonse doenst reutrn anything
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
      {!sessionIsStarted ? (
        <>
          <div className="pre-mockai-container">
            <div className="pre-mockai-content">
              <Stack direction="row" spacing={2}>
                <Avatar
                  alt="Remy Sharp"
                  src="https://www.figma.com/component/e87ba508dce6fb02cc4d09de9fd21bac096663e6/thumbnail?ver=52767%3A24214&fuid=1228001826103345040"
                  sx={{
                    width: "200px",
                    height: "200px",
                    fontSize: "10rem",
                    margin: "0 auto",
                  }}
                />
              </Stack>
              <p>Dog</p>
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
            <Stack direction="row" spacing={2}>
              <Avatar
                alt="Remy Sharp"
                src="https://www.figma.com/component/e87ba508dce6fb02cc4d09de9fd21bac096663e6/thumbnail?ver=52767%3A24214&fuid=1228001826103345040"
                sx={{
                  width: "400px",
                  height: "400px",
                  fontSize: "10rem",
                  margin: "0 auto",
                }}
              />
            </Stack>
            <Button
              variant="contained"
              onClick={startRecording}
              disabled={recording}
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
              disabled={recording || !transcript}
              sx={{ mr: 2, color: "white" }}
            >
              Submit
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
                  {selectedQuestion}
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
