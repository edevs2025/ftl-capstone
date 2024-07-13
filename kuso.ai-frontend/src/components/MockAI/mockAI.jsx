import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
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
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
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
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    recognitionRef.current.stop();
  };

  const fetchAIResponse = async (prompt) => {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const fullPrompt = `You are a mock interviewer. The following is the question: "${selectedQuestion}". The candidate's response is: "${prompt}". Please provide feedback in a paragraph format. Make sure to respond like you're talking to the candidate and grade the response in the following categories: Problem-Solving, Teamwork, Communication, Learning Ability, and Accountability.`;

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
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: fullPrompt },
          ],
          max_tokens: 300,
        }),
      });

      if (!result.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await result.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const responseContent = data.choices[0].message.content;
        console.log("Full AI Response:", responseContent); // Log the full AI response
        simulateRealTimeResponse(responseContent);

        // Extract grades from the response
        const problemSolvingRegex = /Problem-Solving:\s*(\d+)/i;
        const teamworkRegex = /Teamwork:\s*(\d+)/i;
        const communicationRegex = /Communication:\s*(\d+)/i;
        const learningAbilityRegex = /Learning Ability:\s*(\d+)/i;
        const accountabilityRegex = /Accountability:\s*(\d+)/i;

        const problemSolving = responseContent.match(problemSolvingRegex)?.[1];
        const teamwork = responseContent.match(teamworkRegex)?.[1];
        const communication = responseContent.match(communicationRegex)?.[1];
        const learningAbility =
          responseContent.match(learningAbilityRegex)?.[1];
        const accountability = responseContent.match(accountabilityRegex)?.[1];

        const parsedGrades = {
          problemSolving: problemSolving ? parseInt(problemSolving, 10) : 0,
          teamwork: teamwork ? parseInt(teamwork, 10) : 0,
          communication: communication ? parseInt(communication, 10) : 0,
          learningAbility: learningAbility ? parseInt(learningAbility, 10) : 0,
          accountability: accountability ? parseInt(accountability, 10) : 0,
        };

        console.log("Extracted Grades:", parsedGrades); // Log the extracted grades
        setGrades(parsedGrades);
      } else {
        setResponse("No message found in the AI response.");
      }
    } catch (error) {
      setResponse("An error occurred while fetching the response.");
    }
  };

  const simulateRealTimeResponse = (fullResponse) => {
    const words = fullResponse.split(" ");
    let currentResponse = "";
    words.forEach((word, index) => {
      setTimeout(() => {
        currentResponse += `${word} `;
        setResponse(currentResponse);
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

  const data = {
    labels: [
      "Problem-Solving",
      "Teamwork",
      "Communication",
      "Learning Ability",
      "Accountability",
    ],
    datasets: [
      {
        label: "Grades",
        data: grades
          ? [
              grades.problemSolving,
              grades.teamwork,
              grades.communication,
              grades.learningAbility,
              grades.accountability,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  console.log("Chart Data:", data); // Log the data object being passed to the chart

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Mock AI Interview
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
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
        sx={{ mr: 2 }}
      >
        Stop Recording
      </Button>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={recording || !transcript}
        sx={{ mr: 2 }}
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
          <Bar data={data} />
        </Box>
      )}
    </Box>
  );
}

export default MockAI;
