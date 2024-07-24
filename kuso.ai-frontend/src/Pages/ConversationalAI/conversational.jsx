import React, { useState, useEffect, useRef } from "react";
import { fetchOpenAIResponse } from "../../utils";
import "./conversational.css";
import Navbar from "../../components/Navbar/Navbar";

const ConversationalSession = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      console.error("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleUserResponse = async (response) => {
    setSessionHistory((prev) => [...prev, { speaker: "User", text: response }]);
    setTranscript("");

    const userMessage = `User's response: "${response}"`;
    const aiResponse = await getAIResponse(userMessage);

    setSessionHistory((prev) => [
      ...prev,
      { speaker: "Interviewer", text: aiResponse },
    ]);
    speakText(aiResponse);

    const nextQuestion = await getNextQuestion();
    setCurrentQuestion(nextQuestion);
  };

  const getAIResponse = async (userMessage) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    try {
      const response = await fetchOpenAIResponse(apiKey, messages, userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "assistant", content: response },
      ]);
      return response;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "I'm sorry, I'm having trouble responding right now. Could you please repeat that?";
    }
  };

  const getNextQuestion = async () => {
    const nextQuestionPrompt =
      "Generate the next behavioral interview question.";
    try {
      const response = await fetchOpenAIResponse(
        apiKey,
        messages,
        nextQuestionPrompt
      );
      setMessages((prev) => [
        ...prev,
        { role: "user", content: nextQuestionPrompt },
        { role: "assistant", content: response },
      ]);
      return response;
    } catch (error) {
      console.error("Error fetching next question:", error);
      return "I'm sorry, I'm having trouble generating the next question. Let's continue with your previous response.";
    }
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current.stop();
    handleUserResponse(transcript);
  };
  const speakText = (text) => {
    setIsInterviewerSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsInterviewerSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startSession = async () => {
    const initialPrompt =
      "You are an AI interviewer conducting a behavioral interview. Start the interview with an introduction and the first question.";
    try {
      const response = await fetchOpenAIResponse(apiKey, [], initialPrompt);
      setMessages([
        { role: "system", content: initialPrompt },
        { role: "assistant", content: response },
      ]);
      setCurrentQuestion(response);
      speakText(response);
    } catch (error) {
      console.error("Error starting session:", error);
      setCurrentQuestion(
        "I'm sorry, I'm having trouble starting the session. Please try again later."
      );
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Behavioral Interview Simulation</h1>
      <button onClick={startSession} disabled={sessionHistory.length > 0}>
        Start Session
      </button>
      <div>
        <h2>Current Question:</h2>
        <p>{currentQuestion}</p>
      </div>
      <div>
        <h2>Your Response:</h2>
        <p>{transcript}</p>
        <button
          onClick={startListening}
          disabled={isListening || isInterviewerSpeaking}
        >
          Start Speaking
        </button>
        <button
          onClick={stopListening}
          disabled={!isListening || isInterviewerSpeaking}
        >
          Stop Speaking
        </button>
      </div>
      <div>
        <h2>Session History:</h2>
        {sessionHistory.map((entry, index) => (
          <div key={index}>
            <strong>{entry.speaker}:</strong> {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationalSession;
