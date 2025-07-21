# bugs

- room/[roomId]

  - [ ] when a new text comes in it scrolls the whole screen instead of just scrolling the chat box

- src/socket-server/server.js
  - [ ] server crashes during local development if a socket room is open on a uuid that the server does not have game info for. the bug occurs specifically on the `getOpponents` function
