import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  Box, 
  Paper, 
  IconButton, 
  TextField, 
  Typography,
  Badge,
  Avatar,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  Chat as ChatIcon,
  Send,
  Person,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';

const SOCKET_SERVER = 'http://localhost:5000';

function VideoRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username') || 'Anonymous';

  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [users, setUsers] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  const chatMessagesRef = useRef(null);
  const videoGridRef = useRef();

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(SOCKET_SERVER);

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        userVideoRef.current.srcObject = stream;

        // Join room
        socketRef.current.emit('join-room', { room: roomId, username });

        // Handle new user joining
        socketRef.current.on('user-joined', ({ sid, username: newUsername, users }) => {
          console.log('User joined:', sid, newUsername);
          
          const peer = createPeer(sid, socketRef.current.id, stream);
          peersRef.current.push({
            peerId: sid,
            peer,
            username: newUsername
          });
          setPeers([...peersRef.current]);
        });

        // Handle receiving offer
        socketRef.current.on('offer', ({ offer, from }) => {
          console.log('Received offer from:', from);
          const peer = addPeer(offer, from, stream);
          peersRef.current.push({
            peerId: from,
            peer,
            username: 'User'
          });
          setPeers([...peersRef.current]);
        });

        // Handle receiving answer
        socketRef.current.on('answer', ({ answer, from }) => {
          console.log('Received answer from:', from);
          const peerItem = peersRef.current.find(p => p.peerId === from);
          if (peerItem) {
            peerItem.peer.signal(answer);
          }
        });

        // Handle ICE candidate
        socketRef.current.on('ice-candidate', ({ candidate, from }) => {
          console.log('Received ICE candidate from:', from);
          const peerItem = peersRef.current.find(p => p.peerId === from);
          if (peerItem) {
            peerItem.peer.signal(candidate);
          }
        });

        // Handle user left
        socketRef.current.on('user-left', ({ sid }) => {
          console.log('User left:', sid);
          const peerItem = peersRef.current.find(p => p.peerId === sid);
          if (peerItem) {
            peerItem.peer.destroy();
          }
          peersRef.current = peersRef.current.filter(p => p.peerId !== sid);
          setPeers([...peersRef.current]);
        });

        // Handle messages
        socketRef.current.on('new-message', (data) => {
          setMessages(prev => [...prev, data]);
        });

        // Handle room users list
        socketRef.current.on('room-users', ({ currentUsers }) => {
          setUsers(currentUsers);
        });
      })
      .catch(err => {
        console.error('Error accessing media devices:', err);
        alert('Cannot access camera/microphone. Please grant permissions.');
      });

    return () => {
      socketRef.current.disconnect();
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, [roomId, username]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on('signal', signal => {
      socketRef.current.emit('offer', {
        target: userToSignal,
        offer: signal,
        from: callerId
      });
    });

    return peer;
  };

  const addPeer = (incomingOffer, peerId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    peer.on('signal', signal => {
      socketRef.current.emit('answer', {
        target: peerId,
        answer: signal,
        from: socketRef.current.id
      });
    });

    peer.signal(incomingOffer);

    return peer;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketRef.current.emit('message', {
        room: roomId,
        message: newMessage,
        username,
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    }
  };

  const toggleAudio = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const audioTrack = userVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const videoTrack = userVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const leaveRoom = () => {
    socketRef.current.emit('leave-room', { room: roomId });
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoGridRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#1a1a1a',
      color: 'white'
    }}>
      {/* Top Bar */}
      <AppBar position="static" sx={{ bgcolor: '#2d2d2d' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Room: {roomId}
          </Typography>
          <Badge badgeContent={users.length} color="primary" sx={{ mr: 2 }}>
            <Avatar sx={{ bgcolor: '#667eea' }}>
              <Person />
            </Avatar>
          </Badge>
          <Typography variant="body1">
            {username}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Video Grid */}
      <Box 
        ref={videoGridRef}
        sx={{ 
          flex: 1, 
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(400px, 1fr))`,
          gap: 2,
          p: 2,
          overflow: 'auto',
          bgcolor: '#1a1a1a'
        }}
      >
        {/* Local Video */}
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'relative',
            aspectRatio: '16/9',
            overflow: 'hidden',
            borderRadius: 2,
            border: isVideoEnabled ? '3px solid #667eea' : '3px solid #dc3545'
          }}
        >
          <video 
            ref={userVideoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror effect
            }} 
          />
          <Typography 
            sx={{ 
              position: 'absolute', 
              bottom: 10, 
              left: 10, 
              bgcolor: 'rgba(0,0,0,0.6)', 
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: 14
            }}
          >
            {username} (You) {!isVideoEnabled && '🔴 Video Off'}
          </Typography>
        </Paper>

        {/* Remote Videos */}
        {peers.map((peer, index) => (
          <Video 
            key={peer.peerId} 
            peer={peer.peer} 
            username={peer.username} 
          />
        ))}
      </Box>

      {/* Controls */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          p: 2,
          bgcolor: '#2d2d2d',
          borderTop: '1px solid #404040'
        }}
      >
        <IconButton 
          onClick={toggleAudio}
          sx={{ 
            bgcolor: isAudioEnabled ? '#28a745' : '#dc3545',
            '&:hover': { 
              bgcolor: isAudioEnabled ? '#218838' : '#c82333',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s',
            width: 50,
            height: 50
          }}
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </IconButton>

        <IconButton 
          onClick={toggleVideo}
          sx={{ 
            bgcolor: isVideoEnabled ? '#28a745' : '#dc3545',
            '&:hover': { 
              bgcolor: isVideoEnabled ? '#218838' : '#c82333',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s',
            width: 50,
            height: 50
          }}
        >
          {isVideoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>

        <IconButton 
          onClick={leaveRoom}
          sx={{ 
            bgcolor: '#dc3545',
            '&:hover': { 
              bgcolor: '#c82333',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s',
            width: 50,
            height: 50
          }}
        >
          <CallEnd />
        </IconButton>

        <IconButton 
          onClick={() => setIsChatOpen(true)}
          sx={{ 
            bgcolor: '#667eea',
            '&:hover': { 
              bgcolor: '#5a67d8',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s',
            width: 50,
            height: 50
          }}
        >
          <ChatIcon />
        </IconButton>

        <IconButton 
          onClick={toggleFullscreen}
          sx={{ 
            bgcolor: '#6c757d',
            '&:hover': { 
              bgcolor: '#5a6268',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s',
            width: 50,
            height: 50
          }}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        PaperProps={{
          sx: {
            width: 350,
            bgcolor: '#2d2d2d',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chat Messages
          </Typography>
          
          <Divider sx={{ bgcolor: '#404040', mb: 2 }} />

          {/* Messages */}
          <Box 
            ref={chatMessagesRef}
            sx={{ 
              flex: 1, 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 2
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.sid === socketRef.current?.id ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  bgcolor: msg.sid === socketRef.current?.id ? '#667eea' : '#404040',
                  borderRadius: 2,
                  p: 1,
                  px: 2
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                  {msg.username}
                </Typography>
                <Typography variant="body2">
                  {msg.message}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', textAlign: 'right' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Message Input */}
          <Box component="form" onSubmit={sendMessage} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#404040',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                }
              }}
            />
            <IconButton 
              type="submit" 
              sx={{ 
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5a67d8' }
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

// Video component for remote peers
const Video = ({ peer, username }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', stream => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'relative',
        aspectRatio: '16/9',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <video 
        playsInline 
        autoPlay 
        ref={ref} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
      />
      <Typography 
        sx={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 10, 
          bgcolor: 'rgba(0,0,0,0.6)', 
          color: 'white',
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontSize: 14
        }}
      >
        {username || 'Remote User'}
      </Typography>
    </Paper>
  );
};

export default VideoRoom;