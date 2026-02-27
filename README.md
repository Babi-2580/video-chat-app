🎥 Video Chat App - Real-Time Communication Platform
A full-stack video conferencing application built with React, Flask, and WebRTC. Connect with friends and colleagues through high-quality video, voice, and text chat in real-time.

✨ Features
📹 Real-Time Video Calls - Peer-to-peer video streaming with WebRTC

🎤 Voice Communication - Crystal clear audio with mute/unmute controls

💬 Text Chat - Instant messaging with message history

👥 Multi-User Support - Connect with up to 4-6 devices simultaneously

🔒 Private Rooms - Create or join rooms with custom IDs

📱 Responsive Design - Works on desktop and mobile browsers

🔄 Cross-Platform - No installation needed, works in any modern browser

🌐 Local Network - Works offline on same WiFi network

🛠️ Tech Stack
Frontend
React 19 - UI library

Material-UI (MUI v5) - Component library

Socket.io-client - Real-time signaling

Simple-Peer - WebRTC peer connections

React Router DOM - Navigation

Backend
Flask - Python web framework

Flask-SocketIO - WebSocket handling

Flask-CORS - Cross-origin resource sharing

Python-dotenv - Environment variables

📋 Prerequisites
Node.js 20.x (LTS version)

Python 3.8+

npm or yarn

Modern browser with WebRTC support (Chrome, Firefox, Edge)

🚀 Installation & Setup
1. Clone the Repository
bash
git clone https://github.com/Babi-2580/video-chat-app.git
cd video-chat-app
2. Backend Setup
bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-socketio flask-cors python-dotenv

# Create .env file
echo "SECRET_KEY=your-secret-key-here" > .env

# Start backend server
python app.py
Backend runs on http://localhost:5000

3. Frontend Setup
bash
# Open new terminal - navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
Frontend runs on http://localhost:3000

🎯 How to Use
Open the app - Navigate to http://localhost:3000

Enter your name - So others can identify you

Create/Join room - Enter a room ID or generate random one

Allow permissions - Grant camera and microphone access

Share room ID - Tell others to join with same room ID

Start chatting - Video, audio, and text chat work instantly!

📱 Connect from Other Devices
On the same network, use:

text
http://[YOUR_IP_ADDRESS]:3000
Find your IP with ipconfig (Windows) or ifconfig (Mac/Linux)

📁 Project Structure
text
video-chat-app/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── .env                 # Environment variables
│   └── venv/                 # Python virtual environment
├── frontend/
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinRoom.js   # Room joining interface
│   │   │   └── VideoRoom.js  # Video chat interface
│   │   ├── App.js            # Main React component
│   │   └── index.js          # Entry point
│   ├── package.json          # Frontend dependencies
│   └── .gitignore            # Git ignore rules
└── README.md                 # This file
🔧 Configuration
Environment Variables (backend/.env)
env
SECRET_KEY=your-super-secret-key-here
Firewall Configuration
For other devices to connect:

powershell
# Temporarily disable firewall (Windows)
netsh advfirewall set allprofiles state off

# Re-enable after testing
netsh advfirewall set allprofiles state on
🤝 How It Works
Signaling - Users connect to Flask server via WebSocket

Room Management - Server tracks who's in which room

Peer Connection - WebRTC creates direct browser-to-browser video

ICE Candidates - STUN servers help find connection paths

Data Channels - Text chat uses WebRTC data channels

📊 Performance
Max Users: 4-6 devices (mesh architecture)

Latency: < 100ms on same network

Bandwidth: ~1-2 Mbps per stream

Browser Support: Chrome, Firefox, Edge, Safari

🚧 Known Limitations
Limited to 4-6 concurrent users

Requires TURN server for internet connections

No recording functionality

Basic UI (no screen sharing yet)

🔮 Future Enhancements
Screen sharing capability

Cloud deployment guide

TURN server integration for remote access

End-to-end encryption

File sharing

Meeting recording

Virtual backgrounds

🛡️ Security Considerations
All communication is peer-to-peer (no central server for media)

Room IDs are private (share only with intended participants)

No user data stored permanently

HTTPS recommended for production

💻 Development
Backend API Endpoints (Socket.io Events)
Event	Description
join-room	Join a video room
leave-room	Leave current room
offer	WebRTC offer signaling
answer	WebRTC answer signaling
ice-candidate	ICE candidate exchange
message	Send chat message
Frontend Components
JoinRoom - Landing page for name/room input

VideoRoom - Main video chat interface

Video - Reusable video player component

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author
Babi-2580

GitHub: @Babi-2580

🙏 Acknowledgments
WebRTC community

Socket.io team

Material-UI contributors

Flask and Python communities

📞 Support
For issues or questions:

Open an issue on GitHub

Check existing issues for solutions

Refer to WebRTC documentation

🎉 Happy Coding!
Made with ❤️ using React and Flask
