report = {}
raw_data = ""

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

  function check_report(){
    report_str = $(".report").val()
    if(report_str == ""){
        Swal.fire({
            title: 'Error',
            text: 'Please provide the eyewitness report.',
            icon: 'error',
            showConfirmButton: false,
            timer: 3000
          });
        return false
    }else{
        return true
    }
  }

  function check_image(){
    image = $('.upload-image').val()
    if(image == ""){
        Swal.fire({
            title: 'Error',
            text: 'Please upload an image',
            icon: 'error',
            showConfirmButton: false,
            timer: 3000
          });
          return false
    }else{
        return true
    }
  }

  function check_type(){
    var imageFile = $('.upload-image')[0].files[0];

    // get the fileType
    var fileType = imageFile.type;

    // Check if the file type is an image
    if (fileType.startsWith('image/')) {
        if (fileType === 'image/jpeg') {
            return true
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Uplaod a jpg Image captured with Hi-Witness',
                icon: 'error',
                showConfirmButton: false,
                timer: 3000
            });
            return false
        }
    } else {
        Swal.fire({
            title: 'Error',
            text: 'The uploaded file is not an image',
            icon: 'error',
            showConfirmButton: false,
            timer: 3000
        });
        return false
    }
  }

  function get_result(raw_data) {
    if (raw_data) {
      $.post('api/compare', {'meta': raw_data, 'report': $(".report").val()}, function(result) {
        // Use the global 'report' variable explicitly
        report['compare'] = {
          'success': true, 
          'message': result
        }
  
        // Convert the JSON object to a string
        var reportData = JSON.stringify(report);
  
        // Store the string in localStorage
        localStorage.setItem('report', reportData);

        // redirect to the result page
        window.location.href = 'result';

      })
    } else {
      // Use the global 'report' variable explicitly
      report['compare'] = {
        'success': false, 
        'message': 'This report cannot be verified because of non-existent or altered meta-data'
      }

      // Convert the JSON object to a string
      var reportData = JSON.stringify(report);
  
      // Store the string in localStorage
      localStorage.setItem('report', reportData);
    }
  }

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
                    
                    try {
                        raw_data =  decryptWithKey(encrypted_data, key)

                        if(raw_data != ""){
                            report['meta'] = {'success': true, 
                                          'message': `The Image metadata has been verified. It contains unaltered information.`}
                        }else{
                            report['meta'] = {
                                'success': false, 
                                'message': `The Image has failed the metadata verification. It contains compromised or doctored metadata`
                            }
                        }
                        
                    }catch (error) {
                        report['meta'] = {
                                            'success': false, 
                                            'message': `The system cannot verify the image meta-data. This happens on situations where the
                                            image has not been captured with the hi-witness application`
                                        }
                    }
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
$('.verify-btn').on('click', function(e){
    e.preventDefault();
  
    // check if there is an image entered and a text written
    if (check_report() && check_image() && check_type()) {
        // Get the selected image file from the file input
        var imageFile = $('.upload-image')[0].files[0];
       
      // Create a FormData object to store the image data
      var formData = new FormData();
      formData.append('image', imageFile);
  
      // Send the image data to the API using AJAX
      $.ajax({
        url: 'api/predict',  // Replace with your API endpoint URL
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            report['auth'] = {
                'success': true, 
                'message': response.message
            }

            get_result(raw_data, report)
        },
        error: function(xhr, status, error) {
          // Handle any errors
          console.error(xhr, status, error);
          Swal.fire({
            title: 'Error',
            text: 'Error uploading image',
            icon: 'error',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
      
    }
  });
})  