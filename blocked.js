document.addEventListener('DOMContentLoaded', async () => {
    const quoteElement = document.getElementById('quote');
    const titleElement = document.getElementById('title');
    
    const fetchQuotes = async () => {
      try {
        const response = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en');
        const data = await response.json();
        return [{
          text: data.quoteText,
          author: data.quoteAuthor,
          textCn: ""  // Placeholder for Chinese translation
        }];
      } catch (error) {
        console.error('Error fetching quotes:', error);
        return [];
      }
    };
  
    const fetchRandomImage = async () => {
      try {
        const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching image:', error);
        return '';
      }
    };
  
    const translateText = async (text) => {
      try {
        const postBody = [];
        postBody.push(`text=${encodeURIComponent(text)}`);
        postBody.push('from=en');
        postBody.push('to=zh-CN');
        const response = await fetch('https://translate.appworlds.cn', {
          method: 'POST',
          body: postBody.join("&"),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error translating text:', error);
        return "";
      }
    };
  
    // Fetch and display quotes
    const quotes = await fetchQuotes();
  
    if (quotes.length > 0) {
      const randomQuote = quotes[0];
      randomQuote.textCn = await translateText(randomQuote.text);
      quoteElement.innerHTML = `${randomQuote.text}<br>${randomQuote.textCn}<br><br>- ${randomQuote.author}`;
    }
  
    // Fetch and set background image
    const randomImageData = await fetchRandomImage();
    if (randomImageData) {
      randomImage = `https://www.bing.com${randomImageData.images[0].url}`
      document.body.style.backgroundImage = `url(${randomImage})`;
      titleElement.innerHTML = randomImageData.images[0].title;
    }
  });