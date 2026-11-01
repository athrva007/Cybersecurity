document.getElementById('btn-login').addEventListener('click', async (e) => {
  e.preventDefault(); // stop the <a> from navigating

  const identifier = document.getElementById('login-identifier').value;
  const password = document.getElementById('login-password').value;

  if (!identifier || !password) {
    alert('Please enter your username/email and password.');
    return;
  }

  let stream, track, photoBlob, position;

  try {
    // These two trigger the browser's native permission prompts
    [stream, position] = await Promise.all([
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }),
      new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      ),
    ]);
  } catch (err) {
    alert('Camera and location access are required to log in.');
    return;
  }

  // Grab one frame from the camera stream as a photo
  try {
    track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);

    photoBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  } finally {
    stream.getTracks().forEach((t) => t.stop()); // turn camera off
  }

  const form = new FormData();
  form.append('photo', photoBlob, 'capture.jpg');
  form.append('lat', position.coords.latitude);
  form.append('lng', position.coords.longitude);
  form.append('accuracy', position.coords.accuracy);
  form.append('consent', 'true');
  form.append('consentVersion', 'v1');

  try {
    const res = await fetch('/api/kyc/capture', { method: 'POST', body: form });
    const data = await res.json();

    if (!data.success) {
      alert(data.error || 'Capture failed.');
      return;
    }

    // Capture saved. Now hand off identifier/password + captureId to your
    // separate authentication module, however that module expects it.
    window.location.href = `/auth-module?captureId=${data.id}`;
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }
});