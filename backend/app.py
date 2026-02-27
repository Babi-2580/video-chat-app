from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Configure CORS properly
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Store active users
active_users = {}
rooms = {}

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'sid': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Remove user from active users
    for room, users in rooms.items():
        if request.sid in users:
            users.remove(request.sid)
            emit('user_left', {'sid': request.sid}, room=room)
            break
    
    if request.sid in active_users:
        del active_users[request.sid]

@socketio.on('join-room')
def handle_join_room(data):
    room = data['room']
    username = data.get('username', 'Anonymous')
    
    join_room(room)
    
    # Store user info
    if room not in rooms:
        rooms[room] = []
    rooms[room].append(request.sid)
    
    active_users[request.sid] = {
        'username': username,
        'room': room
    }
    
    print(f'{username} joined room: {room}')
    
    # Notify others in the room
    emit('user-joined', {
        'sid': request.sid,
        'username': username,
        'users': rooms[room]
    }, room=room, include_self=False)
    
    # Send list of current users to the new user
    emit('room-users', {
        'users': rooms[room],
        'currentUsers': [{'sid': sid, 'username': active_users.get(sid, {}).get('username', 'Anonymous')} 
                        for sid in rooms[room]]
    }, room=request.sid)

@socketio.on('leave-room')
def handle_leave_room(data):
    room = data['room']
    leave_room(room)
    
    if room in rooms and request.sid in rooms[room]:
        rooms[room].remove(request.sid)
    
    if request.sid in active_users:
        del active_users[request.sid]
    
    emit('user-left', {'sid': request.sid}, room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    message = data['message']
    username = data.get('username', 'Anonymous')
    
    print(f'Message in {room} from {username}: {message}')
    
    emit('new-message', {
        'sid': request.sid,
        'username': username,
        'message': message,
        'timestamp': data.get('timestamp')
    }, room=room)

# WebRTC Signaling
@socketio.on('offer')
def handle_offer(data):
    target_sid = data['target']
    print(f'Offer from {request.sid} to {target_sid}')
    emit('offer', {
        'offer': data['offer'],
        'from': request.sid
    }, room=target_sid)

@socketio.on('answer')
def handle_answer(data):
    target_sid = data['target']
    print(f'Answer from {request.sid} to {target_sid}')
    emit('answer', {
        'answer': data['answer'],
        'from': request.sid
    }, room=target_sid)

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    target_sid = data['target']
    print(f'ICE candidate from {request.sid} to {target_sid}')
    emit('ice-candidate', {
        'candidate': data['candidate'],
        'from': request.sid
    }, room=target_sid)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, host='0.0.0.0')