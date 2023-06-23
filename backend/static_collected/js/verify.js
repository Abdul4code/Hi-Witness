alert()

// Decryption using a key
function decryptWithKey(encryptedData, key) {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decryptedData;
}

// Getting the encryption key
async function get_enc_key() {
    return new Promise((resolve, reject) => {
      $.get('api/key', function(key) {
        resolve(key);
      }).fail(function() {
        reject(new Error('Failed to retrieve encryption key'));
      });
    });
  }
  
  function get_enc_key() {
    return $.ajax({
      url: 'api/key',
      type: 'GET',
      async: false
    }).responseText;
  }
  

report = {}
  
$(document).ready(function() {
    // Listen for the change event on the file input element
    $('.upload-image').change(function(e) {
        // Get the selected file
        var file = e.target.files[0];

        // Check if a file is selected
        if (file) {
            // Create a FileReader object
            var reader = new FileReader();

            // Set the onload callback function
            reader.onload = function(e) {
                // Read the image data as an array buffer
                var arrayBuffer = e.target.result;

                // Get the EXIF metadata using the exif.js library
                var exifData = EXIF.getData(file, function() {
                    encrypted_data = this['exifdata']['UserComment']

                    const key =  JSON.parse(get_enc_key())['key']

                    encrypted = encryptWithKey(data, key)

                    console.log('Decryption key ' + key)
                    console.log('Encyption data ' + encrypted)
                    
                    
                    // try {
                    //     raw_data = decrypted = decryptWithKey(encrypted_data, key)
                    //     console.log('dencyption text ' + raw_data)

                    //     if(raw_data != ""){
                    //         report['meta'] = {'success': true, 
                    //                       'message': `Image meta-data unaltered`}
                    //     }else{
                    //         report['meta'] = {
                    //             'success': false, 
                    //             'message': `The Image Meta-Data has been compromised. 
                    //             This is a compromised Image. Please submit 
                    //             an image captured with Hi-witness and untempred meta-data`
                    //         }
                    //     }
                        
                    // }catch (error) {
                    //     report['meta'] = {
                    //                         'success': false, 
                    //                         'message': `The Image Meta-Data has been compromised. 
                    //                         This is a compromised Image. Please submit 
                    //                         an image captured with Hi-witness and untempred meta-data`
                    //                     }
                    // }

                    console.log(report)
                });                
                
                // Create an image element
                var image = new Image();

                // Set the source of the image to the data URL
                image.src = e.target.result;

                // Append the image element to the "uploaded" div
                $('.uploaded').html(image);
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        } else {
            // If no file is selected, clear the "uploaded" div
            $('.uploaded').empty();
        }
    });
    

/********************************************************* Verify news content */
// Handle image upload form submission
  $('.verify-btn').on('click', function(e) {
    e.preventDefault();

    // Get the selected image file from the file input
    var imageFile = $('.upload-image')[0].files[0];

    // Create a FormData object to store the image data
    var formData = new FormData();
    formData.append('image', imageFile);

    console.log(imageFile)

    // Send the image data to the API using AJAX
    $.ajax({
      url: 'api/predict',  // Replace with your API endpoint URL
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function(response) {
        // Handle the API response
        console.log(response);  // You can customize this based on your requirements
        alert('Image uploaded successfully');
      },
      error: function(xhr, status, error) {
        // Handle any errors
        console.error(xhr, status, error);
        alert('Error uploading image');
      }
  
    });
  });

});