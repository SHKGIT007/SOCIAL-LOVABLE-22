const axios = require('axios');

// Publish a post to Instagram using Graph API
async function instagramPost(accessToken, content, imageUrl, videoUrl) {

  try {
    // Step 1: Create media object (image or video)
    let mediaPayload = {
      caption: content,
      access_token: accessToken
    };
    // Basic video validation
   
    if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== '') {
      mediaPayload.video_url = videoUrl;
    }
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      mediaPayload.image_url = imageUrl;
    }
    let mediaRes;
    try {
      mediaRes = await axios.post('https://graph.instagram.com/me/media', mediaPayload);
    } catch (err) {
      throw new Error('Instagram media creation failed: ' + (err.response?.data?.error?.message || err.message));
    }
    const creationId = mediaRes.data.id;

    // Step 2: Poll status until media is finished
    let status = 'IN_PROGRESS';
    let pollCount = 0;
    while (status !== 'FINISHED' && pollCount < 20) { // max 20 tries (~20s)
      await new Promise(res => setTimeout(res, 1000)); // wait 1s
      const statusRes = await axios.get(`https://graph.instagram.com/${creationId}?fields=status_code&access_token=${accessToken}`);
      status = statusRes.data.status_code;
      pollCount++;
    }
    if (status !== 'FINISHED') {
      throw new Error('Media is not ready for publishing after waiting.');
    }

    // Step 3: Publish media object
    const publishRes = await axios.post('https://graph.instagram.com/me/media_publish', {
      creation_id: creationId,
      access_token: accessToken
    });
    return publishRes.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

module.exports = { instagramPost };

