import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./QuestionBank.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

function createData(question, topic, industry, keywords) {
  return { question, topic, industry, keywords };
}

const rows = [
  createData(
    "1. Tell me a time where you worked as a team",
    "Behavioral",
    "Technical",
    ["teamwork", "collaboration"]
  ),
  createData(
    "2. Describe a challenging project you worked on",
    "Behavioral",
    "Technical",
    ["project", "challenge"]
  ),
  createData(
    "3. How do you handle tight deadlines?",
    "Behavioral",
    "Technical",
    ["deadline", "stress"]
  ),
];

const topics = ["Behavioral", "Technical", "Case Study"];
const industries = ["Technical", "Finance", "Healthcare", "Education"];

function QuestionBank() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTopicChange = (event, newValue) => {
    setSelectedTopic(newValue);
  };

  const handleIndustryChange = (event, newValue) => {
    setSelectedIndustry(newValue);
  };

  const filteredRows = rows.filter(
    (row) =>
      row.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedTopic || row.topic === selectedTopic) &&
      (!selectedIndustry || row.industry === selectedIndustry)
  );

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
              placeholder="Search questions..."
              value={searchQuery}
              onChange={handleSearchChange}
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
                  <TextField {...params} label="Filter by Topic" />
                )}
                style={{ marginTop: "1rem", width: "33%" }}
              />
              <Autocomplete
                options={industries}
                value={selectedIndustry}
                onChange={handleIndustryChange}
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Industry" />
                )}
                style={{ marginTop: "1rem", width: "33%" }}
              />
            </div>
          </div>
          <div className="question-list-container">
            <ul>
              {filteredRows.map((row, index) => (
                <li key={index} className="question-container">
                  <div>{row.question}</div>
                  <div className="question-details">
                    <p>{row.topic}</p>
                    <p>{row.industry}</p>
                    <p>{row.keywords.join(" ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
