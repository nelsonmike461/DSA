import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Button, Alert, Stack } from "@mui/material";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import { API_BASE_URL } from "../config";
import Editor from "@monaco-editor/react";

const QuestionPage = () => {
  const { slug } = useParams();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("// Write your solution here...");
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/questions/${slug}/`);
        setQuestion(res.data);
      } catch (error) {
        console.error("Error fetching question", error);
      }
    };
    fetchQuestion();
  }, [slug]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/submissions/`, {
        question_slug: slug,
        code,
      });
      setSubmissionResult(res.data);
    } catch (error) {
      console.error("Error submitting code", error);
      setSubmissionResult({ verdict: "Error", message: "Submission failed." });
    }
  };

  if (!question) {
    return <Typography sx={{ p: 2 }}>Loading question...</Typography>;
  }

  return (
    <Grid
      container
      spacing={0}
      sx={{
        width: "100vw",
        height: "100vh",
        m: 0,
        p: 0,
      }}
    >
      {/* Left Side: Question Details */}
      <Grid
        item
        xs={6}
        sx={{
          flex: "0 0 50%",
          maxWidth: "50%",
          height: "100%",
          overflowY: "auto",
          borderRight: "1px solid #ccc", // Optional visual divider
        }}
      >
        <Paper
          sx={{
            p: 3,
            height: "100%",
            backgroundColor: "#FFE5B4", // Peach background for left panel
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" gutterBottom>
              {question.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {question.description}
            </Typography>
            {question.input_format && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Input Format:</Typography>
                <Typography variant="body2">{question.input_format}</Typography>
              </Stack>
            )}
            {question.output_format && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Output Format:</Typography>
                <Typography variant="body2">
                  {question.output_format}
                </Typography>
              </Stack>
            )}
            {question.constraints && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Constraints:</Typography>
                <Typography variant="body2">{question.constraints}</Typography>
              </Stack>
            )}
            {question.sample_input && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Sample Input:</Typography>
                <Typography variant="body2" component="pre">
                  {question.sample_input}
                </Typography>
              </Stack>
            )}
            {question.sample_output && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Sample Output:</Typography>
                <Typography variant="body2" component="pre">
                  {question.sample_output}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Right Side: Coding Environment */}
      <Grid
        item
        xs={6}
        sx={{
          flex: "0 0 50%",
          maxWidth: "50%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Paper
          sx={{
            p: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            // backgroundColor: "#000000", // Black background for right panel
            color: "#FFFFFF", // Ensure text (if any) appears in white
          }}
        >
          <Editor
            // theme="vs-dark" // Editor theme (vs-dark works well on a black background)
            height="calc(100% - 80px)" // Adjust height to leave room for the submit area
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button variant="contained" onClick={handleSubmit}>
              Submit Code
            </Button>
            {submissionResult && (
              <Alert
                severity={
                  submissionResult.verdict === "Accepted" ? "success" : "error"
                }
              >
                {submissionResult.message}
              </Alert>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default QuestionPage;
