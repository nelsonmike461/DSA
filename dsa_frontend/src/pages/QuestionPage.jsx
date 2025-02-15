import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Button, Alert, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Editor from "@monaco-editor/react";
import api from "../api";

const QuestionPage = () => {
  const { slug } = useParams();
  const [code, setCode] = useState("# write your solution heree...");
  const [question, setQuestion] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    // Fetch the question details when the component mounts or slug changes
    const fetchQuestion = async () => {
      try {
        const res = await api.get(`/questions/${slug}/`);
        setQuestion(res.data);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };
    fetchQuestion();
  }, [slug]);

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/questions/${slug}/submissions/`, { code });
      const submissionId = res.data.id;

      setSubmissionResult({ verdict: "Pending", message: "Processing..." });

      // Poll every 2 seconds for the submission result
      const checkResult = async (id) => {
        try {
          const resultRes = await api.get(`/submissions/${id}/`);
          if (["Pending", "Running"].includes(resultRes.data.status)) {
            setTimeout(() => checkResult(id), 2000);
          } else {
            // Decide how to display the final result:
            let finalMessage;
            if (Array.isArray(resultRes.data.result)) {
              // If the result is an array, check if all test cases passed:
              const allPassed = resultRes.data.result.every(
                (test) => test.passed === true
              );
              if (allPassed) {
                finalMessage = "All test cases passed";
              } else {
                // Otherwise, show the entire array
                finalMessage = JSON.stringify(resultRes.data.result);
              }
            } else if (typeof resultRes.data.result === "string") {
              // If it's a string, just show it
              finalMessage = resultRes.data.result;
            } else {
              // If it's some other type (object, etc.), stringify it
              finalMessage = JSON.stringify(resultRes.data.result);
            }

            setSubmissionResult({
              verdict: resultRes.data.status,
              message: finalMessage,
            });
          }
        } catch (error) {
          console.error("Error fetching submission result:", error);
          setSubmissionResult({
            verdict: "Error",
            message: "Failed to check result",
          });
        }
      };

      checkResult(submissionId);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionResult({ verdict: "Error", message: "Submission failed" });
    }
  };

  if (!question) {
    return <Typography sx={{ p: 2 }}>Loading question...</Typography>;
  }

  // Helper function to display array fields on a single line
  const formatField = (field) => {
    if (Array.isArray(field)) {
      return field.join(" ");
    }
    return field;
  };

  // split hints line-by-line
  const hintsArray = question.hints
    ? question.hints
        .split(/(?=\d+\.)/)
        .map((hint) => hint.trim())
        .filter(Boolean)
    : [];

  return (
    <Grid
      container
      spacing={0}
      sx={{ width: "100vw", height: "100vh", m: 0, p: 0 }}
    >
      {/* LEFT PANEL */}
      <Grid
        item
        xs={6}
        sx={{
          flex: "0 0 50%",
          maxWidth: "50%",
          height: "100%",
          overflowY: "auto",
          borderRight: "1px solid #ccc",
        }}
      >
        <Paper sx={{ p: 3, height: "100%", backgroundColor: "#FFE5B4" }}>
          <Stack spacing={1}>
            <Typography variant="h5" gutterBottom>
              {question.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {question.description}
            </Typography>

            {question.input_format && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Input Format:</Typography>
                <Typography variant="body2">{question.input_format}</Typography>
              </Stack>
            )}

            {question.output_format && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Output Format:</Typography>
                <Typography variant="body2">
                  {question.output_format}
                </Typography>
              </Stack>
            )}

            {question.constraints && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Constraints:</Typography>
                <Typography variant="body2">{question.constraints}</Typography>
              </Stack>
            )}

            {question.sample_input && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Sample Input:</Typography>
                <Typography variant="body2">
                  {formatField(question.sample_input)}
                </Typography>
              </Stack>
            )}

            {question.sample_output && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Sample Output:</Typography>
                <Typography variant="body2">
                  {formatField(question.sample_output)}
                </Typography>
              </Stack>
            )}

            {hintsArray.length > 0 && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Hints:</Typography>
                {hintsArray.map((hint, index) => (
                  <Typography key={index} variant="body2">
                    {hint}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* RIGHT PANEL */}
      <Grid
        item
        xs={6}
        sx={{ flex: "0 0 50%", maxWidth: "50%", height: "100%" }}
      >
        <Paper
          sx={{
            p: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: "#FFFFFF",
          }}
        >
          {/* Code Editor */}
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value)}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </Box>

          {/* Submit Button + Result */}
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleSubmit}>
              Submit Code
            </Button>
            {submissionResult && (
              <Alert
                sx={{ mt: 1 }}
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
