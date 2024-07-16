import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./QuestionBank.css";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import RadioGroup from "@mui/joy/RadioGroup";
import Radio from "@mui/joy/Radio";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";

function createData(question, topic, industry) {
  return { question, topic, industry };
}

const rows = [
  createData(
    "1. Tell me a time where you worked as a team",
    "Behavioral",
    "Technical"
  ),
  createData(
    "2. Describe a challenging project you worked on",
    "Behavioral",
    "Technical"
  ),
  createData(
    "3. How do you handle tight deadlines?",
    "Behavioral",
    "Technical"
  ),
];

function QuestionBank() {
  const [stripe, setStripe] = React.useState("odd");

  return (
    <div className="question-bank-container">
      <Navbar />
      <h1>behavioral questions</h1>
      <Sheet
        sx={{
          backgroundColor: "#333",
          color: "white",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <FormControl orientation="horizontal" sx={{ mb: 2, ml: 1 }}>
          <FormLabel>Stripe:</FormLabel>
          <RadioGroup
            orientation="horizontal"
            value={stripe}
            onChange={(event) => setStripe(event.target.value)}
          >
            <Radio label="odd" value="odd" />
            <Radio label="even" value="even" />
          </RadioGroup>
        </FormControl>
        <Table
          aria-label="striped table"
          stripe={stripe}
          sx={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "40%",
                  backgroundColor: "#444",
                  color: "#fff",
                  padding: "0.5rem",
                }}
              >
                Question
              </th>
              <th
                style={{
                  backgroundColor: "#444",
                  color: "#fff",
                  padding: "0.5rem",
                }}
              >
                Topic
              </th>
              <th
                style={{
                  backgroundColor: "#444",
                  color: "#fff",
                  padding: "0.5rem",
                }}
              >
                Industry
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 3).map((row, index) => (
              <tr
                key={index}
                style={{ backgroundColor: index % 2 === 0 ? "#555" : "#666" }}
              >
                <td style={{ padding: "0.5rem" }}>{row.question}</td>
                <td style={{ padding: "0.5rem" }}>{row.topic}</td>
                <td style={{ padding: "0.5rem" }}>{row.industry}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </div>
  );
}

export default QuestionBank;
