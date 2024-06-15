// newtab.js

function displayPhoto(photoUrl, title, ownername) {

    const imgContainer =  document.getElementById('imageContainer');
    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = title;

    imgContainer.appendChild(img);
    // document.body.style.backgroundImage = `url('${photoUrl}')`;
    // document.body.style.backgroundSize = 'cover';
    // document.body.style.backgroundPosition = 'center';
    const creditContainer = document.getElementById('creditContainer');
    creditContainer.innerHTML = `Photo by ${ownername}: ${title}`;
    
  }
  
  function fetchImageAsBase64(url, callback) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = function() {
          callback(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => console.error('Error fetching image:', error));
  }
  
  function fetchAndStoreNewPhoto() {
    chrome.storage.local.get(['latestPhotoBase64', 'latestTitle', 'latestOwnername'], function (result) {
      if (result.latestPhotoBase64) {
        // Display the currently stored photo
        displayPhoto(result.latestPhotoBase64, result.latestTitle, result.latestOwnername);
        setTimeout(fetchNewRandomPhotoAndStore, 700);
      } else {
        fetchNewRandomPhotoAndStore();
      }
    });
  }
  
  function fetchNewRandomPhotoAndStore() {
    const apiKey = 'a7fce1119dbee30de1aa59370d51b39e';
    const userIds = ['50785054@N03', '144614754@N02', '143103129@N03', '143103129@N03'];
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
    const flickrApiUrl = `https://www.flickr.com/services/rest/?method=flickr.photos.getPopular&api_key=${apiKey}&user_id=${randomUserId}&sort=faves&extras=url_o%2C+owner_name&per_page=100&format=json&nojsoncallback=1`;
  
    fetch(flickrApiUrl)
      .then(response => response.json())
      .then(data => {
        const photos = data.photos.photo;
        if (photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * photos.length);
          const randomPhoto = photos[randomIndex];
          const photoUrl = randomPhoto.url_o;
          const title = randomPhoto.title;
          const ownername = randomPhoto.ownername;
  
          fetchImageAsBase64(photoUrl, base64Image => {
  
            chrome.storage.local.clear(() => {
              chrome.storage.local.set({
                latestPhotoBase64: base64Image,
                latestTitle: title,
                latestOwnername: ownername
              });
            });
          });
        } else {
          console.error('No photos available from Flickr.');
        }
      })
      .catch(error => {
        console.error('Error fetching data from Flickr API:', error);
      });
  }

  fetchAndStoreNewPhoto();