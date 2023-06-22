function getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject("Geolocation is not supported by this browser.");
        alert('Geolocation is not supported')
      }
    });
  }



// Encryption using a key
function encryptWithKey(data, key) {
  const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
  return encryptedData;
}

/*
getLocation().then((location) => {
  timestamp = location.timestamp
  latitude = location.coords.latitude
  longitude = location.coords.longitude

  data = JSON.stringify({
    long: longitude,
    lat: latitude,
    time: timestamp,
  })

  encrypted = encryptWithKey(data, '12Ab')
  console.log(encrypted)

  decrypted = decryptWithKey(encrypted, '12Ab')
  console.log(decrypted)
}) */

/**************************************************************** CAPTURE IMAGE ******************************************************/
function startCamera(useFrontCamera) {
  const constraints = {
    video: {
      facingMode: useFrontCamera ? "user" : "environment",
      width: { ideal: 1920 },
      height: { ideal: 1920 }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Draw video frames to the canvas
      const context = canvas.getContext("2d");
      setInterval(function () {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }, 16); // Adjust the interval based on your preference
    })
    .catch(function (error) {
      alert("Error accessing camera: " + error);
    });
}

function captureImage() {
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Create a temporary canvas to display the captured image
  const tempCanvas = document.createElement("canvas");
  const tempContext = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempContext.putImageData(imageData, 0, 0);

  // Convert the image data to a data URL in JPEG format
  const image = tempCanvas.toDataURL("image/jpeg", 1.0); // Quality set to 1.0 for maximum quality

  // Load the EXIF data from the image
  const exifData = piexif.load(image);

  // Modify the EXIF metadata as needed
  getLocation().then((location) => {
    timestamp = location.timestamp;
    latitude = location.coords.latitude;
    longitude = location.coords.longitude;

    data = JSON.stringify({
      long: longitude,
      lat: latitude,
      time: timestamp,
    })
  
    encrypted = encryptWithKey(data, '12Ab')

    exifData.Exif[piexif.ExifIFD.UserComment] = encrypted

    // Convert the modified EXIF data back to the binary format
    const updatedExifBinary = piexif.dump(exifData);

    // Insert the updated EXIF data into the image data URL
    const updatedImageDataURL = piexif.insert(updatedExifBinary, image);

    // Open the captured image with updated metadata in a new tab
    html = `
          <a href="${updatedImageDataURL}" download>
            <div class="gal-image">
                  <img src="${updatedImageDataURL}" />
            </div>
          </a>
    `;
    $('.gallery-cont').append(html);
  });
}

const canvas = document.getElementById("myCanvas");
const captureButton = document.getElementById("capture-btn");

canvas.width = 1920; // Set canvas width to desired image width
canvas.height = 1920; // Set canvas height to desired image height

captureButton.addEventListener("click", captureImage);

// Start the camera when the window has loaded
window.addEventListener("load", function(){
    startCamera(false);
});

