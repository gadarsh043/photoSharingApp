import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

function ActivityFeedPopup({ isOpen, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/activities");
      setActivities(response.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Recent Activities
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <List>
            {activities.map((activity) => (
              <ListItem key={activity._id}>
                <ListItemText
                  primary={`${activity.activity_type} by ${activity.user_id.first_name} ${activity.user_id.last_name}`}
                  secondary={new Date(activity.date_time).toLocaleString()}
                />
                {activity.photo?.file_name && (
                  <Avatar
                    src={`/images/${activity.photo.file_name}`}
                    alt="Thumbnail"
                    style={{ marginRight: "10px", width: "50px", height: "50px" }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ActivityFeedPopup;
