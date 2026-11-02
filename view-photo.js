// npm i mongoose dotenv
// Usage: node view-photo.js <documentId>
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const KycCapture = require('./src/models/KycCapture'); // adjust path if needed

const docId = process.argv[2];
if (!docId) {
  console.error('Usage: node view-photo.js <documentId>');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const doc = await KycCapture.findById(docId);
  if (!doc) {
    console.error('No document found with that id.');
    process.exit(1);
  }

  const ext = doc.photo.contentType === 'image/png' ? 'png' : 'jpg';
  const outPath = `./capture-${docId}.${ext}`;
  fs.writeFileSync(outPath, doc.photo.data);
  console.log(`Saved to ${outPath}`);
  process.exit(0);
})();