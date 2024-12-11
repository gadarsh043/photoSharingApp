import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge
} from "@mui/material";
import { Link } from "react-router-dom";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PhotoCameraBackIcon from '@mui/icons-material/PhotoCameraBack';
import io from "socket.io-client";
// import fetchModel from "../../lib/fetchModelData";
import fetchAxios from "../../lib/fetchAxiosData";

import CommentsPopup from "../CommentsPopup";
import "./styles.css";

const socket = io(); // Connect to the WebSocket server

function UserList({ advanceFeature }) {
  const [users, setUser] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [openCommentsPopup, setOpenCommentsPopup] = useState(false);
  const [comments, setComments] = useState([]);

  const getPhotosOfUser = async (userId) => {
    try {
      const response = await fetchAxios(`/photosOfUser/${userId}`);
      return response.data;
    } catch (err) {
      return 0;
    }
  };

  useEffect(() => {
    const getUserList = async () => {
      try {
        const response = await fetchAxios("/user/list");
        setUser(response.data);
        const photosOfAllUser = await Promise.all(
          response.data.map(async (user) => {
            const photosOfUser = await getPhotosOfUser(user._id);
            return { userId: user._id, photos: photosOfUser };
          })
        );
        const countsMap = {};
        photosOfAllUser.forEach(({ userId, photos }) => {
          const photosLength = photos.length;
          const commentsCount = photos.reduce((total, photo) => total + photo.comments.length, 0);
          countsMap[userId] = {
            photosLength,
            commentsCount,
            comments: photos.flatMap((photo, photoIndex) => photo.comments.map(comment => ({
              photoId: photo.user_id,
              text: comment.comment,
              photoIndex: photoIndex,
              thumbnailUrl: photo.file_name,
            })))
          };
        });
        setUserCounts(countsMap);
      } catch (err) {
        console.log(err);
      }
    };
    getUserList();
    socket.on("newActivity", (activity) => {
      setUser((prevUsers) => prevUsers.map((user) => (user._id === activity.user_id
            ? {
                ...user,
                lastActivity: {
                  type: activity.activity_type,
                  date_time: activity.date_time,
                  thumbnail: activity.photo_id ? activity.photo_id : null,
                },
              }
            : user)
        )
      );
    });
  
    // Cleanup on unmount
    return () => {
      socket.off("newActivity");
      socket.disconnect();
    };
  }, []);

  const handleOpenCommentsPopup = (userId) => {
    setComments(userCounts[userId].comments || []);
    setOpenCommentsPopup(true);
  };

  const handleCloseCommentsPopup = () => {
    setOpenCommentsPopup(false);
  };

  return (
    <div className="userList-container">
      <Typography variant="h4" className="userList-title">
        Friends
      </Typography>
      <List component="nav">
        {users.map((user, index) => (
          <div key={user._id} className="main-div">
            <ListItem component={Link} to={`/users/${user._id}`} className="userList-item" >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              {user.lastActivity && (
                  <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start', backgroundColor: '#B8CAE4', padding: '5px', borderRadius: '5px'}}>
                    <div className="user-activity">
                      {(user.lastActivity.type === "Photo Upload" || user.lastActivity.type === "New Comment") && (
                          <img src={`/images/${user.lastActivity.thumbnail}`} alt="thumbnail" />
                      )}
                      <span>{user.lastActivity.type}</span>
                      <br />
                    </div>
                    <small>{new Date(user.lastActivity.date_time).toLocaleString()}</small>
                  </div>
              )}
            </ListItem>
            {advanceFeature && (
              <>
                <Badge className="photos" badgeContent={userCounts[user._id]?.photosLength || 0} color="success">
                  <PhotoCameraBackIcon color="action" fontSize="small" />
                </Badge>
                <Badge className="comments" badgeContent={userCounts[user._id]?.commentsCount || 0} color="error" onClick={() => handleOpenCommentsPopup(user._id)}>
                  <ChatBubbleOutlineIcon color="action" fontSize="small" />
                </Badge>
              </>
            )}
            {index < users.length - 1 && <Divider className="userList-divider" />}
          </div>
        ))}
      </List>
      <CommentsPopup open={openCommentsPopup} onClose={handleCloseCommentsPopup} comments={comments} />
    </div>
  );
}

export default UserList;
