import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./QuestionBank.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import { styled } from "@mui/material/styles";
import axios from "axios";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const questionsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/questions`);
        setQuestions(response.data);
        setTotalPages(Math.ceil(response.data.length / questionsPerPage));
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    const fetchTopicsAndIndustries = async () => {
      try {
        const topicsResponse = await axios.get(`http://localhost:3000/topics`);
        const industriesResponse = await axios.get(
          `http://localhost:3000/industries`
        );
        setTopics(topicsResponse.data);
        setIndustries(industriesResponse.data);
      } catch (error) {
        console.error("Error fetching topics or industries:", error);
      }
    };

    fetchQuestions();
    fetchTopicsAndIndustries();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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
    navigate(`/mockai/${id}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredRows = questions.filter(
    (row) =>
      row.questionContent.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedTopic || row.topic === selectedTopic) &&
      (!selectedIndustry ||
        row.industries.some((industry) => industry.name === selectedIndustry))
  );

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
      <h3 id="header">Master your interviews with confidence</h3>
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
                options={topics}
                value={selectedTopic}
                onChange={handleTopicChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Topic"
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
              {paginatedRows.map((row) => (
                <li
                  key={row.questionId}
                  className="question-container"
                  onClick={() => handleQuestionClick(row.questionId)}
                  style={{ fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <div>
                    {row.questionId}. {row.questionContent}
                  </div>
                  <div className="question-topics">
                    {row.keyword.map((word, index) => (
                      <span key={index} className="keyword">
                        {word}
                      </span>
                    ))}
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
            <h3>Topics</h3>
            <ul>
              {topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionBank;
