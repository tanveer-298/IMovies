const fs = require('fs');
const filePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\src\\controllers\\bookingController.js';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(
  'const holdUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);',
  'const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);'
);
content = content.replace(
  'seat.heldUntil = holdUntil;',
  'seat.heldUntil = heldUntil;'
);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed heldUntil variable definition');
