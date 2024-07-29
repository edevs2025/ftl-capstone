import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Don't forget to import axios
import { fetchOpenAIResponse } from "../../utils";
import "./conversational.css";
import Navbar from "../../components/Navbar/Navbar";
import { useAuthContext } from "../../AuthContext"; // Assuming you have a custom hook for authentication

const ConversationalSession = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const { authToken, userId } = useAuthContext(); // Custom hook for auth context
  const lastProcessedTranscriptRef = useRef("");
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [audioSources, setAudioSources] = useState([]);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
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

        setTranscript((prevTranscript) => {
          if (finalTranscript) {
            if (finalTranscript !== prevTranscript) {
              return finalTranscript;
            }
          } else if (interimTranscript) {
            if (interimTranscript !== prevTranscript) {
              return interimTranscript;
            }
          }
          return prevTranscript;
        });
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
      setTranscript((currentTranscript) => {
        if (currentTranscript !== lastProcessedTranscriptRef.current) {
          lastProcessedTranscriptRef.current = currentTranscript;
          handleUserResponse(currentTranscript);
        }
        return currentTranscript;
      });
    }, 2200); // 3 seconds of silence
  };

  const startListening = () => {
    setTranscript("");
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
    const trimmedResponse = response.trim();
    if (trimmedResponse !== "") {
      setSessionHistory((prev) => [
        ...prev,
        { speaker: "User", text: trimmedResponse },
      ]);

      const userMessage = `User's response: "${trimmedResponse}"`;
      const aiResponse = await getAIResponse(userMessage);

      setSessionHistory((prev) => [
        ...prev,
        { speaker: "Interviewer", text: aiResponse },
      ]);
      speakText(aiResponse);
    } else {
      console.log("Empty response received, not processing.");
      startListening(); // Restart listening if the response was empty
    }
    setTranscript("");
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

  const speakText = async (text) => {
    setIsInterviewerSpeaking(true);
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
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
        source.playbackRate.value = 1.15;
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

    setAudioSources(newAudioSources);
    setIsInterviewerSpeaking(false);
    startListening();
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
