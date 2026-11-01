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

module.exports = router;