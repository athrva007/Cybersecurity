// // npm i multer
// const express = require('express');
// const multer = require('multer');
// const KycCapture = require('../models/KycCapture');

// const router = express.Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
//   fileFilter: (req, file, cb) =>
//     cb(null, ['image/jpeg', 'image/png'].includes(file.mimetype)),
// });

// // POST /api/kyc/capture
// // multipart/form-data: photo (file), userId, lat, lng, accuracy, consent, consentVersion
// router.post(
//   '/capture',
//   (req, res, next) =>
//     upload.single('photo')(req, res, (err) =>
//       err ? res.status(400).json({ success: false, error: err.message }) : next()
//     ),
//   async (req, res, next) => {
//     try {
//       const { lat, lng, accuracy, consent, consentVersion } = req.body;

//       if (consent !== 'true')
//         return res.status(400).json({ success: false, error: 'Consent required' });
//       if (!req.file)
//         return res.status(400).json({ success: false, error: 'Photo (jpeg/png) required' });

//       const latitude = parseFloat(lat);
//       const longitude = parseFloat(lng);
//       if (
//         !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
//         Math.abs(latitude) > 90 || Math.abs(longitude) > 180
//       ) {
//         return res.status(400).json({ success: false, error: 'Invalid location' });
//       }

//       const doc = await KycCapture.create({
//         photo: { data: req.file.buffer, contentType: req.file.mimetype },
//         location: {
//           type: 'Point',
//           coordinates: [longitude, latitude],
//           accuracyMeters: parseFloat(accuracy) || undefined,
//         },
//         consentGiven: true,
//         consentTextVersion: consentVersion,
//         ip: req.ip,
//         userAgent: req.get('user-agent'),
//       });

//       res.status(201).json({ success: true, id: doc._id });
//     } catch (err) {
//       next(err); // handled by your global error handler
//     }
//   }
// );

// module.exports = router;


// npm i multer
const express = require('express');
const multer = require('multer');
const KycCapture = require('../models/KycCapture');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png'].includes(file.mimetype)),
});

// POST /api/kyc/capture
// multipart/form-data: photo (file), userId, lat, lng, accuracy, consent, consentVersion
router.post(
  '/capture',
  (req, res, next) =>
    upload.single('photo')(req, res, (err) =>
      err ? res.status(400).json({ success: false, error: err.message }) : next()
    ),
  async (req, res, next) => {
    console.log('KYC capture hit. body:', req.body, 'file:', req.file);
    try {
      const { lat, lng, accuracy, consent, consentVersion } = req.body;

      if (consent !== 'true')
        return res.status(400).json({ success: false, error: 'Consent required' });
      if (!req.file)
        return res.status(400).json({ success: false, error: 'Photo (jpeg/png) required' });

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (
        !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180
      ) {
        return res.status(400).json({ success: false, error: 'Invalid location' });
      }

      const doc = await KycCapture.create({
        photo: { data: req.file.buffer, contentType: req.file.mimetype },
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
          accuracyMeters: parseFloat(accuracy) || undefined,
        },
        consentGiven: true,
        consentTextVersion: consentVersion,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({ success: true, id: doc._id });
    } catch (err) {
      next(err); // handled by your global error handler
    }
  }
);

// GET /api/kyc/photo/:id — serves the raw image so you can open it directly in a browser
router.get('/photo/:id', async (req, res, next) => {
  try {
    const doc = await KycCapture.findById(req.params.id);
    if (!doc) return res.status(404).send('Not found');
    res.set('Content-Type', doc.photo.contentType);
    res.send(doc.photo.data);
  } catch (err) {
    next(err);
  }
});

// GET /api/kyc/gallery — lists every capture with a thumbnail and its location
router.get('/gallery', async (req, res, next) => {
  try {
    const docs = await KycCapture
      .find()
      .sort({ capturedAt: -1 })
      .select('_id location capturedAt verificationStatus')
      .lean();

    const rows = docs.map((d) => `
      <div style="display:inline-block;margin:10px;text-align:center;font-family:sans-serif">
        <img src="/api/kyc/photo/${d._id}" style="width:160px;height:160px;object-fit:cover;border-radius:8px" />
        <div style="font-size:12px;margin-top:4px">
          ${d._id}<br/>
          ${d.location.coordinates[1].toFixed(5)}, ${d.location.coordinates[0].toFixed(5)}<br/>
          ${new Date(d.capturedAt).toLocaleString()}<br/>
          status: ${d.verificationStatus}
        </div>
      </div>`).join('');

    res.send(`<html><body>${rows || 'No captures yet.'}</body></html>`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;