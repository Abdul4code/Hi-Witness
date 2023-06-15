function getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  }



getLocation().then((location) => {
    timestamp = location.timestamp
    latitude = location.coords.latitude
    longitude = location.coords.longitude

    console.log(timestamp)
})

/**************************************************************** CAPTURE IMAGE ******************************************************/

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
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
        alert("Error accessing camera: ", error);
      });
  }
  
  // Capture image from the canvas
  function captureImage() {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas to display the captured image
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempContext.putImageData(imageData, 0, 0);
    
    // Open the captured image in a new tab
    const image = tempCanvas.toDataURL("image/jpg");
    const newTab = window.open("", "_blank");
    newTab.document.write('<img src="' + image + '" alt="Captured Image" />');
  }


const canvas = document.getElementById("myCanvas");
const captureButton = document.getElementById("capture-btn");

captureButton.addEventListener("click", captureImage);

// Start the camera when the window has loaded
window.addEventListener("load", startCamera);



  
  