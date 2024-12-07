import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

function SuccessPopup({ open, onClose, photoUploadMessage }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {photoUploadMessage}
        </Typography>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Modal>
  );
}

export default SuccessPopup;
