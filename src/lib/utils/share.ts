interface ShareData {
  title: string;
  text: string;
  url: string;
}

export async function shareUrl(data: ShareData) {
  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (err) {
      console.log('Error sharing:', err);
      fallbackShare(data);
    }
  } else {
    fallbackShare(data);
  }
}

function fallbackShare(data: ShareData) {
  // Create a temporary input element
  const input = document.createElement('input');
  input.value = data.url;
  document.body.appendChild(input);
  
  // Select the text
  input.select();
  input.setSelectionRange(0, 99999); // For mobile devices
  
  // Copy the text to clipboard
  document.execCommand('copy');
  
  // Remove the temporary element
  document.body.removeChild(input);
  
  // Alert the user
  alert('Link copied to clipboard!');
}