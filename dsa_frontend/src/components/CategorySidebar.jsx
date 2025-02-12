import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

const categories = [
  "Arrays and Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
];

const CategorySidebar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div>
      <Typography variant="h6" sx={{ p: 2 }}>
        Categories
      </Typography>
      <Divider />
      <List>
        {categories.map((category) => (
          <ListItem key={category} disablePadding>
            <ListItemButton
              selected={selectedCategory === category}
              onClick={() => onSelectCategory(category)}
            >
              <ListItemText primary={category} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default CategorySidebar;
