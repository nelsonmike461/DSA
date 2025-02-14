import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";

const QuestionList = ({ questions }) => {
  return (
    <div>
      <Typography variant="h6" sx={{ p: 2 }}>
        Questions
      </Typography>
      <Divider />
      <List>
        {questions.map((question) => (
          <ListItem key={question.slug} disablePadding>
            <ListItemButton component={Link} to={`/question/${question.slug}`}>
              <ListItemText
                primary={question.title}
                secondary={question.difficulty}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default QuestionList;
