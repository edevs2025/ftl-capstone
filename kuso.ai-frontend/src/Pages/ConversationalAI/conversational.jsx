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
  const [sessionStarted, setSessionStarted] = useState(false);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

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
        resetSilenceTimeout();
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
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening]);

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      handleUserResponse(transcript);
    }, 3000); // 2.5 seconds of silence
  };

  const startListening = () => {
    setIsListening(true);
    recognitionRef.current.start();
    resetSilenceTimeout();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current.stop();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  const handleUserResponse = async (response) => {
    stopListening();
    setSessionHistory((prev) => [...prev, { speaker: "User", text: response }]);
    setTranscript("");

    const userMessage = `User's response: "${response}"`;
    const aiResponse = await getAIResponse(userMessage);

    setSessionHistory((prev) => [
      ...prev,
      { speaker: "Interviewer", text: aiResponse },
    ]);
    speakText(aiResponse);
  };

  const getAIResponse = async (userMessage) => {
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

  const speakText = (text) => {
    setIsInterviewerSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsInterviewerSpeaking(false);
      startListening(); 
    };
    window.speechSynthesis.speak(utterance);
  };

  const startSession = async () => {
    setSessionStarted(true);
    const initialPrompt =
      "You are an AI interviewer conducting a behavioral interview. Start the interview with a brief introduction and the first question.";
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

  const finishSession = () => {
    stopListening();
    setSessionStarted(false);
    setSessionHistory([]);
    setMessages([]);
    setCurrentQuestion("");
    setTranscript("");
  };

  return (
    <div>
      <Navbar />
      <h1>Behavioral Interview Simulation</h1>
      {!sessionStarted && <button onClick={startSession}>Start Session</button>}
      {sessionStarted && (
        <>
          <div>
            <h2>Current Question:</h2>
            <p>{currentQuestion}</p>
          </div>
          <div>
            <h2>Your Response:</h2>
            <p>{transcript}</p>
          </div>
          <div>
            <h2>Session History:</h2>
            {sessionHistory.map((entry, index) => (
              <div key={index}>
                <strong>{entry.speaker}:</strong> {entry.text}
              </div>
            ))}
          </div>
          <button onClick={finishSession}>Finish Interview</button>
        </>
      )}
    </div>
  );
};

export default ConversationalSession;
