export { services };

const axios = require('axios');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36260944-793d422ca89e59203aaed5090';

const services = {
  getImages: async function (searchQuery, page, RESULTS_PER_PAGE) {
    try {
      const response = await axios.get(
        `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${RESULTS_PER_PAGE}`
      );
      const images = response;
      return images;
    } catch (error) {
      console.error(error);
    }
  },
};
