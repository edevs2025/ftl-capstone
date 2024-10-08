import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import { useAuthContext } from "../../AuthContext";
import { Box, Button, Typography } from "@mui/material";
import AiEffect from "../Landing/AiEffect";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import "./conversational.css";

const ConversationalSession = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const { isSignedIn, userId } = useAuthContext();
  const lastProcessedTranscriptRef = useRef("");
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [audioSources, setAudioSources] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [interviewVoice, setInterviewVoice] = useState("shimmer");
  const [conversationHistory, setConversationHistory] = useState([]);

  const interviewers = [
    {
      name: "Shimmer",
      voice: "shimmer",
      image:
        "https://www.figma.com/component/e87ba508dce6fb02cc4d09de9fd21bac096663e6/thumbnail?ver=52767%3A24214&fuid=1228001826103345040",
    },
    {
      name: "Alloy",
      voice: "alloy",
      image:
        "https://s3-alpha.figma.com/checkpoints/T7L/thp/HrUl6sYUAMJxLJdw/52767_23922.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQ4GOSFWCVDFANMME%2F20240728%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240728T120000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=81a3fd438d5561b8ff4053ea1e10ca1f5028e28a7316db68b81292d2415f5e3e",
    },
    {
      name: "Echo",
      voice: "echo",
      image:
        "https://www.figma.com/component/26fc6dc8630017f4cc236c31b4662626533cf919/thumbnail?ver=52767%3A24210&fuid=1228001826103345040",
    },
    {
      name: "Fable",
      voice: "fable",
      image:
        "https://www.figma.com/component/252fc33c0305364520a23f439789194c70172416/thumbnail?ver=52767%3A24221&fuid=1228001826103345040",
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
  }, [isSignedIn, userId]);

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
        setIsUserSpeaking(true);
        resetSilenceTimeout();
      };

      recognitionRef.current.onaudiostart = () => {
        setIsUserSpeaking(true);
      };

      recognitionRef.current.onaudioend = () => {
        setIsUserSpeaking(false);
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
  }, []);

  const fetchOpenAIResponse = async (
    apiKey,
    conversationHistory,
    userMessage
  ) => {
    const pastHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: currentQuestion },
    ];

    const fullPrompt = pastHistory.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const promptAi = [
      {
        role: "system",
        content: `You are an interviewer interviewing a candidate. If the conversation gets off-track from the interview, revert the conversation topic back to the interview. Here is the conversation history:`,
      },
      ...fullPrompt,
    ];

    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: promptAi,
        max_tokens: 200,
      }),
    });
    if (!result.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await result.json();
    return data.choices[0].message.content;
  };

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      setIsUserSpeaking(false);
      setTranscript((currentTranscript) => {
        if (currentTranscript !== lastProcessedTranscriptRef.current) {
          lastProcessedTranscriptRef.current = currentTranscript;
          handleUserResponse(currentTranscript);
        }
        return currentTranscript;
      });
    }, 2000);
  };

  const startListening = () => {
    setTranscript("");
    setIsListening(true);
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
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
    const trimmedResponse = response.trim();
    if (trimmedResponse !== "") {
      stopListening();

      setConversationHistory(
        conversationHistory.push({ role: "user", content: trimmedResponse })
      );

      const userMessage = `User's response: "${trimmedResponse}"`;
      const aiResponse = await getAIResponse(userMessage);

      setConversationHistory(
        conversationHistory.push({ role: "assistant", content: aiResponse })
      );

      await speakText(aiResponse);
      startListening();
    } else {
      startListening();
    }
    setTranscript("");
  };

  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetchOpenAIResponse(
        apiKey,
        conversationHistory,
        userMessage
      );
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

  useEffect(() => {}, [conversationHistory]);

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
    return new Promise(async (resolve) => {
      setIsAISpeaking(true);
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
          const audioBuffer = await newAudioContext.decodeAudioData(
            arrayBuffer
          );

          const source = newAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.playbackRate.value = 1.15;
          source.connect(newAudioContext.destination);
          newAudioSources.push(source);

          await new Promise((resolveChunk) => {
            source.onended = resolveChunk;
            source.start();
          });
        } catch (error) {
          console.error("Error playing audio chunk:", error);
        }
      }

      setAudioSources(newAudioSources);
      setIsAISpeaking(false);
      setIsInterviewerSpeaking(false);
      resolve();
    });
  };

  const startSession = async () => {
    setSessionStarted(true);
    const initialPrompt = `You are an interviewer conducting a behavioral interview. 
    Start the interview by greeting the user and then prompt the first 
    question. The user's name is ${userData.firstName}\n\n ONLY RETURN 
    THE ACTUAL INTRODUCTION\n\n\n After appropriate responses, please
     prompt the user to the next question. If the user ever gets off 
     track redirect them to the question. If the user asks for 
     clarification, provide it.`;

    try {
      const response = await fetchOpenAIResponse(apiKey, [], initialPrompt);
      setMessages([
        { role: "system", content: initialPrompt },
        { role: "assistant", content: response },
      ]);
      setCurrentQuestion(response);
      setConversationHistory(
        conversationHistory.push({ role: "assistant", content: response })
      );
      await speakText(response);
      startListening();
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
    window.location.reload();
  };

  return (
    <div className={isAISpeaking ? "ai-speaking" : "user-speaking"}>
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
      {!sessionStarted ? (
        <div className="pre-mockai-container">
          <div className="pre-mockai-content">
            <Stack direction="row" spacing={2}>
              <Avatar
                alt={selectedInterviewer ? selectedInterviewer.name : "Shimmer"}
                src={
                  selectedInterviewer
                    ? selectedInterviewer.image
                    : "https://www.figma.com/component/e87ba508dce6fb02cc4d09de9fd21bac096663e6/thumbnail?ver=52767%3A24214&fuid=1228001826103345040"
                }
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
              {selectedInterviewer ? selectedInterviewer.name : "Shimmer"}
            </p>
            <Button
              className="start-session-button"
              onClick={startSession}
              sx={{ color: "black ", backgroundColor: "white" }}
            >
              Start Session
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`mockai-container ${isAISpeaking ? "ai-speaking" : ""}`}
        >
          <Button
            onClick={finishSession}
            sx={{
              width: "150px",
              margin: "0 auto",
              color: "white",
              backgroundColor: "black",
              marginTop: "3rem",
            }}
          >
            End Session
          </Button>

          <div className="ai-content">
            <Stack
              direction="column"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
              spacing={2}
            >
              <div className="ai-speaking-indicator"></div>
              <Avatar
                alt={
                  selectedInterviewer ? selectedInterviewer.name : "Shimmer"
                }
                src={selectedInterviewer ? selectedInterviewer.image : "https://www.figma.com/component/e87ba508dce6fb02cc4d09de9fd21bac096663e6/thumbnail?ver=52767%3A24214&fuid=1228001826103345040"}
                sx={{
                  width: "400px",
                  height: "400px",
                  fontSize: "10rem",
                  margin: "0 auto",
                }}
              />
            </Stack>
          </div>
        </div>
      )}
      {sessionStarted && (
        <div
          className={`user-speaking-indicator ${
            isUserSpeaking ? "pulsating" : "idle"
          }`}
        ></div>
      )}
    </div>
  );
};

export default ConversationalSession;
