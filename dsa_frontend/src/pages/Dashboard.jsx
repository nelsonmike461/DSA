import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CategorySidebar from "../components/CategorySidebar";
import QuestionList from "../components/QuestionList";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] =
    useState("Arrays and Strings");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/questions/?category=${encodeURIComponent(
            selectedCategory
          )}`
        );
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions", error);
      }
    };
    fetchQuestions();
  }, [selectedCategory]);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4} md={3}>
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          {questions.length ? (
            <QuestionList questions={questions} />
          ) : (
            <Typography variant="body1" sx={{ p: 2 }}>
              No questions available for this category.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
