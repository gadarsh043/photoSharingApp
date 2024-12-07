import React, { useEffect, useState } from "react";
import { Typography, Button, Box } from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData";
import fetchAxios from "../../lib/fetchAxiosData";

import "./styles.css";

function UserDetail({advanceFeature}) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [recentPhoto, setRecentPhoto] = useState(null);
  const [recentPhotoIndex, setRecenPhotoIndex] = useState(null);
  const [topCommentedPhoto, setTopCommentedPhoto] = useState(null);
  const [recentCommentedPhotoIndex, setRecentCommentedPhotoIndex] = useState(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchedUser = window.models.userModel(userId);
  //   setUser(fetchedUser);
  // }, [userId]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAxios(`/user/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUsers();
  }, [userId]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const recentResponse = await fetchAxios(`/user/${userId}/photos/recent`);
        setRecenPhotoIndex(recentResponse.data.originalIndex);
        setRecentPhoto(recentResponse.data.photo);

        const topCommentedResponse = await fetchAxios(`/user/${userId}/photos/top-commented`);
        setRecentCommentedPhotoIndex(topCommentedResponse.data.originalIndex);
        setTopCommentedPhoto(topCommentedResponse.data.photo);
      } catch (err) {
        setRecentPhoto(null);
        setTopCommentedPhoto(null);
        console.error(err);
      }
    };
    fetchPhotos();
  }, [userId]);

  if (!user) {
    return <Typography>Loading user details...</Typography>;
  }

  return (
    <Box className="userDetail-container">
      <Typography variant="h3" className="userDetail-header">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="subtitle1" className="userDetail-subtitle">
        {user.occupation} - {user.location}
      </Typography>
      <Typography
        variant="h5"
        className="userDetail-description"
        dangerouslySetInnerHTML={{ __html: user.description }}
      />
      <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: '10px'}}>
        {recentPhoto && (
          <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', backgroundColor: ' #e3f2fd', padding: '10px'}}>
            <Typography variant="h6">Most Recent Photo</Typography>
            <img
              src={`/images/${recentPhoto.file_name}`}
              alt="Recent"
              onClick={() => {
                if (advanceFeature) {
                  navigate(`/photos/${userId}/${recentPhotoIndex}`);
                } else {
                  navigate(`/photos/${userId}`);
                }
              }}
              style={{ width: '100px', height: '100px', cursor: 'pointer' }}
            />
            <Typography variant="body2">Uploaded: {new Date(recentPhoto.date_time).toLocaleDateString()}</Typography>
          </Box>
        )}
    
        {topCommentedPhoto && (
          <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', backgroundColor: ' #e3f2fd', padding: '10px'}}>
            <Typography variant="h6">Most Commented Photo</Typography>
            <img
              src={`/images/${topCommentedPhoto.file_name}`}
              alt="Top Commented"
              onClick={() => {
                if (advanceFeature) {
                  navigate(`/photos/${userId}/${recentCommentedPhotoIndex}`);
                } else {
                  navigate(`/photos/${userId}`);
                }
              }}
              style={{ width: '100px', height: '100px', cursor: 'pointer' }}
            />
            <Typography variant="body2">Comments: {topCommentedPhoto.comments.length}</Typography>
          </Box>
        )}
      </div>
  
      <Button
        variant="outlined"
        className="userDetail-button"
        component={Link}
        to={`/photos/${userId}`}
      >
        View Photos
      </Button>
    </Box>
  );
}

export default UserDetail;

