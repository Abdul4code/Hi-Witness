// Decryption using a key
function decryptWithKey(encryptedData, key) {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decryptedData;
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
                    
                    try {
                        raw_data = decrypted = decryptWithKey(encrypted_data, '12Ab')
                        
                        if(raw_data != ""){
                            report['meta'] = {'success': true, 
                                          'message': `Image meta-data unaltered`}
                        }else{
                            report['meta'] = {
                                'success': false, 
                                'message': `The Image Meta-Data has been compromised. 
                                This is a compromised Image. Please submit 
                                an image captured with Hi-witness and untempred meta-data`
                            }
                        }
                        
                    }catch (error) {
                        report['meta'] = {
                                            'success': false, 
                                            'message': `The Image Meta-Data has been compromised. 
                                            This is a compromised Image. Please submit 
                                            an image captured with Hi-witness and untempred meta-data`
                                        }
                    }

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
});