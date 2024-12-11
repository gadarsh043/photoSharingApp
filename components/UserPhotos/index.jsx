import React, { useEffect, useState } from "react";
import { Typography, Box, Card, CardMedia, CardContent, Divider, Button, TextField, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import fetchAxios from "../../lib/fetchAxiosData";
import "./styles.css";

function UserPhotos({ advanceFeature, user }) {
  const { userId, photoIndex } = useParams();
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(parseInt(photoIndex, 10) || 0);
  const [newComments, setNewComments] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getUserPhotos = async () => {
      try {
        const response = await fetchAxios(`/photosOfUser/${userId}`);
        setPhotos(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUserPhotos();
  }, [userId]);

  useEffect(() => {
    setCurrentPhotoIndex(parseInt(photoIndex, 10) || 0);
  }, [photoIndex]);

  const goToPhoto = (index) => {
    setCurrentPhotoIndex(index);
    navigate(`/photos/${userId}/${index}`);
  };

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      goToPhoto(currentPhotoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      goToPhoto(currentPhotoIndex - 1);
    }
  };

  const handleCommentChange = (photoId, value) => {
    setNewComments(prevComments => ({
      ...prevComments,
      [photoId]: value
    }));
  };

  const handleAddComment = async (photoId, index, file_name) => {
    if (!newComments[photoId]?.trim()) {
      setCommentErrors(prevErrors => ({
        ...prevErrors,
        [photoId]: "Comment cannot be empty"
      }));
      return;
    }
    try {
      let response = await axios.post(`/commentsOfPhoto/${photoId}`, { comment: newComments[photoId], fileName: file_name  });
      setNewComments(prevComments => ({
        ...prevComments,
        [photoId]: ''
      }));
      setCommentErrors(prevErrors => ({
        ...prevErrors,
        [photoId]: ''
      }));
      const newCommentWithCurrentUser = {
        ...response.data,
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name
        }
      };
      setPhotos((prevPhotos) => {
        const updatedPhotos = [...prevPhotos];
        updatedPhotos[index].comments.push(newCommentWithCurrentUser);
        return updatedPhotos;
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentErrors(prevErrors => ({
        ...prevErrors,
        [photoId]: "Failed to add comment"
      }));
    }
  };

  const handleToggleLike = async (photoId, index) => {
    try {
      const response = await axios.post(`/photos/${photoId}/toggleLike`);
      setPhotos((prevPhotos) => {
        const updatedPhotos = [...prevPhotos];
        updatedPhotos[index].likes = response.data.likes;
        updatedPhotos[index].liked = response.data.liked;
        return updatedPhotos;
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (!photos.length) {
    return <Typography>Loading photos...</Typography>;
  }

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <Box padding={2} className="customBox">
      {advanceFeature ? (
        <Box className="main-card">
          <Card key={currentPhoto._id} variant="outlined" sx={{ marginBottom: 2 }}>
          <CardMedia
              component="img"
              image={`/images/${currentPhoto.file_name}`}
              alt={`${currentPhoto.file_name}`}
              sx={{
                height: "300px",
                width: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                border: "1px solid #ddd",
                borderBottom: "none"
              }}
            />
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Uploaded on: {new Date(currentPhoto.date_time).toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center" marginTop={2}>
                <IconButton
                  onClick={() => handleToggleLike(currentPhoto._id, currentPhotoIndex)}
                  style={{
                    color: currentPhoto?.likes?.includes(user._id) ? "red" : "gray", // Check if user ID is in likes array
                  }}
                >
                  {currentPhoto?.likes?.includes(user._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" style={{ marginLeft: "8px" }}>
                  {currentPhoto?.likes?.length} {currentPhoto?.likes?.length === 1 ? "Like" : "Likes"}
                </Typography>
              </Box>
              {currentPhoto.comments && currentPhoto.comments.length > 0 && (
                <Box marginTop={2}>
                  <Typography variant="h6">Comments</Typography>
                  <Divider />
                  {currentPhoto.comments.map((comment) => (
                    <Box key={comment._id || comment.date_time} className="commentBox" marginTop={2} padding={2}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {new Date(comment.date_time).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textPrimary">
                        <Link to={`/users/${comment?.user?._id}`} style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                          {comment?.user?.first_name} {comment?.user?.last_name}
                        </Link>
                        : {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box marginTop={2}>
                <TextField
                  label="Add a comment"
                  value={newComments[currentPhoto._id] || ''}
                  onChange={(e) => handleCommentChange(currentPhoto._id, e.target.value)}
                  fullWidth
                  variant="outlined"
                  error={Boolean(commentErrors[currentPhoto._id])}
                  helperText={commentErrors[currentPhoto._id]}
                />
                <Button variant="contained" color="primary" onClick={() => handleAddComment(currentPhoto._id, currentPhotoIndex)} sx={{ marginTop: 1 }}>
                  Submit Comment
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Box display="flex" justifyContent="space-between">
            <Button onClick={handlePrevious} disabled={currentPhotoIndex === 0}>Prev</Button>
            <Button onClick={handleNext} disabled={currentPhotoIndex === photos.length - 1}>Next</Button>
          </Box>
        </Box>
      ) : (
        photos.map((photo, index) => (
          <Card key={photo._id} variant="outlined" sx={{ marginBottom: 2 }} className="main-card">
            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`}
              alt={`${photo.file_name}`}
              sx={{
                height: "300px",
                width: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                border: "1px solid #ddd",
                borderBottom: "none"
              }}
            />
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" className="uploadedOn">
                Uploaded on: {new Date(photo.date_time).toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center" marginTop={2}>
                <IconButton
                  onClick={() => handleToggleLike(photo._id, index)}
                  style={{
                    color: photo?.likes?.includes(user._id) ? "red" : "gray",
                  }}
                >
                  {photo?.likes?.includes(user._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" style={{ marginLeft: "8px" }}>
                  {photo?.likes?.length} {photo?.likes?.length === 1 ? "Like" : "Likes"}
                </Typography>
              </Box>
              {photo.comments && photo.comments.length > 0 && (
                <Box marginTop={2}>
                  <Typography variant="h6">Comments</Typography>
                  <Divider />
                  {photo.comments.map((comment) => (
                    <Box key={comment._id || comment.date_time} className="commentBox" marginTop={2} padding={2}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {new Date(comment.date_time).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textPrimary">
                        <Link to={`/users/${comment?.user?._id}`} style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}>
                          {comment?.user?.first_name} {comment?.user?.last_name}
                        </Link>
                        : {comment.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box marginTop={2}>
                <TextField
                  label="Add a comment"
                  value={newComments[photo._id] || ''}
                  onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                  fullWidth
                  variant="outlined"
                  error={Boolean(commentErrors[photo._id])}
                  helperText={commentErrors[photo._id]}
                />
                <Button variant="contained" color="primary" onClick={() => handleAddComment(photo._id, index, photo.file_name)} sx={{ marginTop: 1 }}>
                  Submit Comment
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default UserPhotos;
