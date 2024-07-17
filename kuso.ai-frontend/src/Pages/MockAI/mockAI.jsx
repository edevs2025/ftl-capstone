import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
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
import questionsData from "./questions.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function MockAI() {
  const [response, setResponse] = useState("");
  const [transcript, setTranscript] = useState(
    "At my previous job, we faced a significant challenge when our main product experienced a critical bug just before an important client presentation. The bug caused the software to crash, and we had less than 24 hours to fix it. I coordinated with the development team to identify the root cause and worked overnight to implement and test the solution. We managed to resolve the issue and successfully delivered the presentation on time. This experience taught me the importance of teamwork and staying calm under pressure."
  );
  const [recording, setRecording] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [grades, setGrades] = useState(null);
  const [audio] = useState(new Audio());

  const recognitionRef = useRef(null);

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

  const fetchAIResponse = async (prompt) => {
    const API_KEY = "sk-proj-sNfRUWMn9Myrg0sJbUDuT3BlbkFJpvgsZ6X7YH6zrSBrr0tb";
    const fullPrompt = `You are an interviewer. The following is the question: "${selectedQuestion}". The candidate's response is: "${prompt}". Please provide feedback and respond in 2nd person. and also return the grades in the following categories: Relevance, Clarity, Problem-Solving from 0.0 to 5.0. The response should be in the following JSON format: { "feedback": "<your feedback here>", "grades": { "Relevance": <grade>, "Clarity": <grade>, "Problem-Solving": <grade> } }`;

    try {
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
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

        await fetchTTS(feedback);

        simulateRealTimeResponse(feedback);

        setGrades({
          problemSolving: grades["Problem-Solving"] || 0,
          relevance: grades["Relevance"] || 0,
          clarity: grades["Clarity"] || 0,
        });

        console.log("Extracted Grades:", grades);
      } else {
        setResponse("No message found in the AI response.");
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      setResponse("An error occurred while fetching the response.");
    }
  };

  const fetchTTS = async (text) => {
    try {
      const response = await fetch("http://localhost:3001/generate-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.play();
    } catch (error) {
      console.error("Error fetching TTS:", error);
    }
  };

  const simulateRealTimeResponse = (feedback) => {
    const words = feedback.split(" ");
    let currentResponse = "";
    words.forEach((word, index) => {
      setTimeout(() => {
        currentResponse += `${word} `;
        setResponse(currentResponse);
        if (index === words.length - 1) {
          audio.play();
        }
      }, index * 100);
    });
  };

  const handleQuestionSelect = (event) => {
    setSelectedQuestion(event.target.value);
    setTranscript("");
    setResponse("");
    setGrades(null);
    setTranscript(
      "At my previous job, we faced a significant challenge when our main product experienced a critical bug just before an important client presentation. The bug caused the software to crash, and we had less than 24 hours to fix it. I coordinated with the development team to identify the root cause and worked overnight to implement and test the solution. We managed to resolve the issue and successfully delivered the presentation on time. This experience taught me the importance of teamwork and staying calm under pressure."
    );
  };

  const handleSubmit = () => {
    fetchAIResponse(transcript);
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
        },
        title: {
          display: true,
          text: "Score",
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
      },
    },
  };

  return (
    <>
      <button>Go to Conversational</button>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mock AI Interview
        </Typography>
        <FormControl fullWidth sx={{ mb: 2, backgroundColor: "white" }}>
          <InputLabel id="question-select-label">Select a question</InputLabel>
          <Select
            labelId="question-select-label"
            id="question-select"
            value={selectedQuestion}
            onChange={handleQuestionSelect}
          >
            <MenuItem value="">--Select a question--</MenuItem>
            {questionsData.questions.map((question, index) => (
              <MenuItem key={index} value={question}>
                {question}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Selected Question:</Typography>
          <Typography>{selectedQuestion}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Transcript:</Typography>
          <Typography>{transcript}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">AI Response:</Typography>
          <ReactMarkdown>{response}</ReactMarkdown>
        </Box>
        {grades && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Grades:</Typography>
            <Bar data={data} options={options} />
          </Box>
        )}
      </Box>
    </>
  );
}

export default MockAI;
