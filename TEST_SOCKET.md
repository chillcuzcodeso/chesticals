# Socket.io Test

Open browser console and type this in BOTH windows:

```javascript
// Test 1: Check if socket exists
console.log('Socket exists:', window.socket);

// Test 2: Manually send a test message
socket.emit('move', { roomId: 'GM3690', move: { from: 'e2', to: 'e4' } });

// Test 3: Listen for moves
socket.on('opponent-move', (data) => {
  console.log('GOT MOVE:', data);
});
```

Tell me if you see "GOT MOVE:" in the other window!
