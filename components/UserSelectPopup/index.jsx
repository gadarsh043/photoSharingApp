import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";
import axios from "axios";

function UserSelectPopup({ open, onClose, onConfirm, loggedInUser }) {
  const [userList, setUserList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch user list when the popup is opened
  useEffect(() => {
    if (open) {
      const fetchUserList = async () => {
        try {
          const response = await axios.get("/user/list");
          // Exclude logged-in user from the list
          const filteredUsers = response.data.filter((user) => user._id !== loggedInUser._id);
          setUserList(filteredUsers);

          // Preselect the logged-in user (hidden by default)
          setSelectedUsers([loggedInUser._id]);
        } catch (err) {
          console.error("Error fetching user list:", err);
        }
      };

      fetchUserList();
    }
  }, [open, loggedInUser]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedUsers);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Users to Share With
        </Typography>
        {userList.length === 0 ? (
          <Typography variant="body2">Loading users...</Typography>
        ) : (
          userList.map((user) => (
            <FormControlLabel
              key={user._id}
              control={(
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleCheckboxChange(user._id)}
                />
              )}
              label={`${user.first_name} ${user.last_name}`}
            />
          ))
        )}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UserSelectPopup;
