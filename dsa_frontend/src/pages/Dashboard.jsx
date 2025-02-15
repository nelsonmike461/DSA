import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
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
    <Box
      sx={{
        display: "flex",
        height: "100vh", // Ensures the dashboard fills the viewport height
        overflow: "hidden", // Prevents the entire page from scrolling
      }}
    >
      {/* Sidebar Section */}
      <Box
        sx={{
          width: { xs: "100%", md: "25%" },
          overflowY: "auto", // If sidebar content overflows, scroll only the sidebar
          borderRight: "1px solid #ccc",
        }}
      >
        <CategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </Box>

      {/* Main Content Section */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto", // Only this area scrolls if content overflows
        }}
      >
        {questions.length ? (
          <QuestionList questions={questions} />
        ) : (
          <Typography variant="body1" sx={{ p: 2 }}>
            No questions available for this category.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
