import React, { useState }  from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Switch from '@mui/material/Switch';
import UserSelectPopup from "../UserSelectPopup";
import ActivityFeedPopup from "../ActivityFeed";

import "./styles.css";

function TopBar({contentTitle, advanceFeature, onToggle, user, logout, onPhotoUpload}) {
  const [isUserSelectOpen, setUserSelectOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isActivityFeedOpen, setActivityFeedOpen] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUserSelectOpen(true);
    }
  };

  const handleUserSelectConfirm = (selectedUsers) => {
    if (file) {
      const formData = new FormData();
      formData.append("photo", file);
      if (selectedUsers.length > 0) {
        formData.append("sharing_list", JSON.stringify(selectedUsers));
      }
      onPhotoUpload(formData).finally(() => {
        setFile(null);
      });
    }
  };
  
  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography className="buttonClick" variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
          {user?._id ? `Hi ${user.first_name}` : 'Please Login'}
        </Typography>

        <Typography className="buttonClick" variant="h5" color="inherit">
          {contentTitle}
        </Typography>
        {
          user?._id ? 
          (
            <>
              <Button variant="contained" component="label" style={{marginLeft: '10px'}}>
                Add Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <Button variant="contained" component="label" style={{marginLeft: '10px'}} onClick={() => setActivityFeedOpen(!isActivityFeedOpen)}>
                Activities
              </Button>
              <button className="logout-button" onClick={() => {logout();}}>
                Log Out
              </button>
              <div className="toggleSwitch">
                <Switch
                  checked={advanceFeature}
                  onChange={onToggle}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                Advanced Features
              </div>
            </>
          )
          : ''
        }
      </Toolbar>
      <UserSelectPopup
        open={isUserSelectOpen}
        onClose={() => setUserSelectOpen(false)}
        onConfirm={handleUserSelectConfirm}
        loggedInUser={user}
      />
      <ActivityFeedPopup
        isOpen={isActivityFeedOpen}
        onClose={() => setActivityFeedOpen(false)}
      />
    </AppBar>
  );
}

export default TopBar;
