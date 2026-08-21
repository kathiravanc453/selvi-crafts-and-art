const fs = require('fs');
const path = require('path');

const clientDist = path.join(__dirname, '..', 'frontend', 'client', 'dist');
const adminDist = path.join(__dirname, '..', 'frontend', 'admin', 'dist');
const targetAdminDist = path.join(clientDist, 'admin');

if (fs.existsSync(adminDist)) {
  fs.cpSync(adminDist, targetAdminDist, { recursive: true });
  console.log('Successfully bundled Admin Panel into frontend/client/dist/admin!');
} else {
  console.error('Admin dist directory does not exist at ' + adminDist);
}
