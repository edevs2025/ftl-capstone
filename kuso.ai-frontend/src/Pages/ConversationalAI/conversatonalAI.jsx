import React, { useState, useEffect, useRef } from "react";

const ConversationalSession = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);

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

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current.stop();
    handleUserResponse(transcript);
  };

  const handleUserResponse = async (response) => {
    // Add user's response to session history
    setSessionHistory((prev) => [...prev, { speaker: "User", text: response }]);
    setTranscript("");

    // Get AI response (you'll need to implement this function)
    const aiResponse = await getAIResponse(response, currentQuestion);

    // Add AI's response to session history
    setSessionHistory((prev) => [
      ...prev,
      { speaker: "Interviewer", text: aiResponse },
    ]);

    // Speak AI's response
    speakText(aiResponse);

    // Get next question (you'll need to implement this function)
    const nextQuestion = await getNextQuestion();
    setCurrentQuestion(nextQuestion);
  };

  const speakText = (text) => {
    setIsInterviewerSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsInterviewerSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startSession = async () => {
    // Get initial question (you'll need to implement this function)
    const initialQuestion = await getInitialQuestion();
    setCurrentQuestion(initialQuestion);
    speakText(initialQuestion);
  };

  return (
    <div>
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
