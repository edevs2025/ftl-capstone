import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { Box, Typography, Button } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import "./QuestionBank.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import { styled } from "@mui/material/styles";
import axios from "axios";
import ParticleEffect from "../Landing/ParticleEffect"; // Adjust the import path as needed
import { useAuthContext } from "../../AuthContext";

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    color: "white",
    backgroundColor: "#212121",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    "&:hover": {
      backgroundColor: "#646cff",
      opacity: ".7",
    },
    "&.Mui-selected": {
      backgroundColor: "#646cff",
      color: "white",
      "&:hover": {
        backgroundColor: "#646cff",
      },
    },
  },
}));

function QuestionBank() {
  const keywords = [
    "diagnosis",
    "compliance",
    "ethics",
    "deadlines",
    "strategy",
    "patient care",
    "regulations",
    "failure",
    "trends",
    "academic performance",
    "planning",
    "deadline",
    "software",
    "time management",
    "project management",
    "adaptability",
    "conflict resolution",
    "lean manufacturing",
    "debugging",
    "prioritization",
    "guest experience",
    "implementation",
    "troubleshooting",
    "analytics",
    "customer service",
    "client management",
    "communication",
    "research",
    "legal skills",
    "customer experience",
    "security",
    "impact",
    "financial analysis",
    "tools",
    "case management",
    "resource management",
    "success",
    "laboratory management",
    "data analysis",
    "education",
    "budget management",
    "production management",
    "public relations",
    "challenge",
    "efficiency",
    "intervention",
    "risk management",
    "data analytics",
    "digital marketing",
    "policy development",
    "assessment tools",
    "software tools",
    "sales",
    "marketing",
    "business processes",
    "launch",
    "dedication",
    "operational efficiency",
    "quality control",
    "technical skills",
    "deadline management",
    "continuous learning",
    "business impact",
    "process improvement",
    "campaign management",
    "automation",
    "decision-making",
    "digital tools",
    "public sector",
    "safety",
    "goal achievement",
    "learning",
    "inventory management",
    "legal tools",
    "management systems",
    "analytical skills",
    "environmental impact",
    "creativity",
    "management",
    "innovation",
    "LIMS",
    "public service",
    "results",
    "performance",
    "crisis management",
    "problem-solving",
    "simplification",
    "data-driven strategy",
    "engineering",
    "product launch",
    "stress management",
    "sustainability",
    "diversity",
    "legal knowledge",
    "leadership",
    "teaching",
    "platforms",
    "policy",
    "attention to detail",
    "advocacy",
    "product development",
    "multitasking",
    "teamwork",
    "pressure",
    "complexity",
    "hospitality",
    "curriculum development",
    "optimization",
    "multidisciplinary",
    "technology",
    "guest satisfaction",
    "goal-setting",
    "collaboration",
    "quick thinking",
    "student management",
    "guest relations",
    "empathy",
    "professional development",
    "regulatory compliance",
  ];
  const topics = ["behavioral", "case study", "technical"];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const questionsPerPage = 10;
  const { isSignedIn, userId } = useAuthContext();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [userIndustries, setUserIndustries] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `https://ftl-capstone.onrender.com/questions`
        );
        setQuestions(response.data);
        setTotalPages(Math.ceil(response.data.length / questionsPerPage));
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchBookmarkedQuestions = async () => {
      if (isSignedIn && userId) {
        try {
          const response = await axios.get(
            `https://ftl-capstone.onrender.com/user/${userId}`
          );
          console.log(response);
          setBookmarkedQuestions(
            response.data.questions.map((q) => q.questionId)
          );
        } catch (error) {
          console.error("Error fetching bookmarked questions:", error);
        }
      }
    };

    fetchBookmarkedQuestions();
  }, [isSignedIn, userId]);

  useEffect(() => {
    const getUserIndustries = async () => {
    if (isSignedIn && userId) {
      try {
        
          const response = await axios.get(
            `https://ftl-capstone.onrender.com/user/${userId}`
          );
          setUserIndustries(response.data.industries);
          console.log("userIndustries", userIndustries)
       }
       catch (error) {
        console.error("Error fetching industries:", error)
      }
    }
  }

    getUserIndustries();
  }, [isSignedIn, userId]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleKeywordChange = (event, newValue) => {
    setSelectedKeyword(newValue);
    setPage(1);
  };

  const handleTopicChange = (event, newValue) => {
    setSelectedTopic(newValue);
    setPage(1);
  };

  const handleIndustryChange = (event, newValue) => {
    setSelectedIndustry(newValue);
    setPage(1);
  };

  const handleQuestionClick = (id) => {
    if (!isSignedIn) {
      // Store the question ID and URL in localStorage before redirecting
      localStorage.setItem("pendingQuestionId", id);
      localStorage.setItem("pendingUrl", `/mockai/${id}`);
      navigate("/signup");
    } else {
      navigate(`/mockai/${id}`);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleIndustryClick = (industry) => {
    if (industry === "My Industries") {
      // Toggle between user's industries and no selection
      setSelectedIndustry(prevSelected => 
        prevSelected.length === userIndustries.length ? [] : userIndustries.map(ind => ind.industryName)
      );
    } else {
      setSelectedIndustry(prevSelected => {
        if (prevSelected.includes(industry)) {
          return prevSelected.filter(ind => ind !== industry);
        } else {
          return [...prevSelected, industry];
        }
      });
    }
    setPage(1);
  };

  const clearIndustryFilter = () => {
    setSelectedIndustry(null);
  };

  const handleBookmark = async (questionId, event) => {
    event.stopPropagation(); // Prevent triggering the question click event

    if (!isSignedIn) {
      localStorage.setItem("pendingQuestionIdMark", questionId);
      navigate("/signup");
      return;
    }

    // Immediately update UI
    setBookmarkedQuestions((prevBookmarks) =>
      prevBookmarks.includes(questionId)
        ? prevBookmarks.filter((id) => id !== questionId)
        : [...prevBookmarks, questionId]
    );

    try {
      console.log("question id", questionId);
      console.log("bookmaked ones", bookmarkedQuestions);
      if (bookmarkedQuestions.includes(questionId)) {
        console.log("next question id", questionId);
        await axios.delete(
          `https://ftl-capstone.onrender.com/user/${userId}/question/`,
          { data: { questionId: questionId } }
        );
      } else {
        await axios.post(
          `https://ftl-capstone.onrender.com/user/${userId}/question/`,
          { questionId: questionId }
        );
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      // Revert UI change if API call fails
      setBookmarkedQuestions((prevBookmarks) =>
        prevBookmarks.includes(questionId)
          ? prevBookmarks.filter((id) => id !== questionId)
          : [...prevBookmarks, questionId]
      );
    }
  };

  const filteredRows = questions.filter(
    (row) =>
      row.questionContent.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedKeyword || row.keyword.includes(selectedKeyword)) &&
      (!selectedTopic || row.keyword.includes(selectedTopic)) &&
      (selectedIndustry.length === 0 || 
       row.industries.some((ind) => selectedIndustry.includes(ind.industryName)))
  );

  console.log("selected industry",selectedIndustry)

  const paginatedRows = filteredRows.slice(
    (page - 1) * questionsPerPage,
    page * questionsPerPage
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredRows.length / questionsPerPage));
  }, [filteredRows]);

  return (
    <div className="question-bank">
      <Navbar />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Ensure ParticleEffect is in the background
        }}
      >
        <ParticleEffect />
      </Box>
      <div
        className="question-bank-content"
        style={{ position: "relative", zIndex: 1 }}
      >
        <h3 id="header">Master Your Interviews With Confidence</h3>
        <div className="question-bank-container">
          <div className="left-column">
            <div className="filter-container">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search questions"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#212121",
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#40c9ff",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  "& .MuiInputAdornment-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  "& input": {
                    color: "white",
                  },
                  "& input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <div className="filter-labels">
                <Autocomplete
                  options={keywords}
                  value={selectedKeyword}
                  onChange={handleKeywordChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by keywords"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#212121",
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#40c9ff",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                        "& input": {
                          color: "white",
                        },
                      }}
                    />
                  )}
                  style={{
                    marginTop: "1rem",
                    width: "33%",
                  }}
                  sx={{
                    "& .MuiAutocomplete-paper": {
                      backgroundColor: "#212121",
                      color: "white",
                    },
                    "& .MuiAutocomplete-option": {
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      '&[aria-selected="true"]': {
                        backgroundColor: "rgba(64, 201, 255, 0.3)",
                      },
                    },
                    "& .MuiAutocomplete-listbox": {
                      backgroundColor: "#212121",
                      color: "white",
                    },
                    "& .MuiAutocomplete-tag": {
                      backgroundColor: "rgba(64, 201, 255, 0.3)",
                      color: "white",
                    },
                  }}
                />

                <Autocomplete
                  options={topics}
                  value={selectedTopic}
                  onChange={handleTopicChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by topics"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#212121",
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#40c9ff",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                        "& input": {
                          color: "white",
                        },
                      }}
                    />
                  )}
                  style={{
                    marginTop: "1rem",
                    width: "33%",
                  }}
                  sx={{
                    "& .MuiAutocomplete-paper": {
                      backgroundColor: "#212121",
                      color: "white",
                    },
                    "& .MuiAutocomplete-option": {
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      '&[aria-selected="true"]': {
                        backgroundColor: "rgba(64, 201, 255, 0.3)",
                      },
                    },
                    "& .MuiAutocomplete-listbox": {
                      backgroundColor: "#212121",
                      color: "white",
                    },
                    "& .MuiAutocomplete-tag": {
                      backgroundColor: "rgba(64, 201, 255, 0.3)",
                      color: "white",
                    },
                  }}
                />
              </div>
            </div>
            <div className="question-list-container">
              <ul>
                {paginatedRows.map((row, index) => (
                  <li
                    key={row.questionId}
                    className="question-container"
                    onClick={() => handleQuestionClick(row.questionId)}
                    style={{
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div>
                      {(page - 1) * 10 + index + 1}. {row.questionContent}
                    </div>
                    <div className="question-topics">
                      {row.keyword.map((word, index) => (
                        <span key={index} className="keyword">
                          {word}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`bookmark-icon ${
                        bookmarkedQuestions.includes(row.questionId)
                          ? "bookmarked"
                          : ""
                      }`}
                      onClick={(e) => handleBookmark(row.questionId, e)}
                    >
                      {bookmarkedQuestions.includes(row.questionId) ? (
                        <BookmarkIcon style={{ color: "white" }} />
                      ) : (
                        <BookmarkBorderIcon style={{ color: "white" }} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <StyledPagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            />
          </div>
          <div className="right-column">
            <div className="topics-container">
              <h3>Industry</h3>
              <ul>
                {[
                  "My Industries",
                  "General",
                  "Information Technology",
                  "Healthcare and Medical",
                  "Finance and Insurance",
                  "Education",
                  "Manufacturing",
                  "Retail and Consumer Goods",
                  "Marketing and Advertising",
                  "Engineering and Construction",
                  "Government and Public Administration",
                  "Business Services",
                  "Hospitality and Travel",
                  "Pharmaceuticals and Biotechnology",
                  "Legal Services",
                  "Environmental Services",
                  "Arts, Media, and Entertainment",
                ].map((industry, index) => (
                  <li
                    key={index}
                    onClick={() => handleIndustryClick(industry)}
                    style={{
                      cursor: "pointer",
                      color: selectedIndustry.includes(industry) ? "#FFFFFF" : "inherit",
                      fontWeight: selectedIndustry.includes(industry) ? "bold" : "normal",
                      backgroundColor: selectedIndustry.includes(industry) ? "#646cff" : "inherit",
                    }}
                  >
                    {industry}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionBank;
