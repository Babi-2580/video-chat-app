import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid
} from '@mui/material';
import { VideoCall, Casino } from '@mui/icons-material';

function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      navigate(`/room/${roomId}?username=${encodeURIComponent(username)}`);
    }
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4
          }}
        >
          <Avatar
            sx={{
              mx: 'auto',
              mb: 2,
              bgcolor: 'white',
              width: 80,
              height: 80
            }}
          >
            <VideoCall sx={{ fontSize: 50, color: '#667eea' }} />
          </Avatar>

          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Video Chat App
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
            Join or Create a Room
          </Typography>

          <Box component="form" onSubmit={handleJoin}>
            <TextField
              fullWidth
              label="Your Name"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2
                }
              }}
            />

            <TextField
              fullWidth
              label="Room ID"
              variant="outlined"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2
                }
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={generateRoomId}
                  startIcon={<Casino />}
                  sx={{
                    py: 1.5,
                    bgcolor: '#28a745',
                    '&:hover': { bgcolor: '#218838' }
                  }}
                >
                  Random
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    py: 1.5,
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5a67d8' }
                  }}
                >
                  Join Room
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default JoinRoom;