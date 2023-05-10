import { services } from './js/axios.js';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  btnForm: document.querySelector('[type="submit"]'),
  galleryCards: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

const DELAY = 1500;
const RESULTS_PER_PAGE = 40;
let totalPages = 1;
let totalImages = 1;
let page = 1;
let searchTerm = '';
let markup = '';
let lastImage;

let observer = new IntersectionObserver(
  (entrys, observer) => {
    entrys.forEach(entry => {
      if (entry.isIntersecting) {
        page++;
        layoutUtils.refreshImagesList(searchTerm, page, RESULTS_PER_PAGE);
      }
    });
  },
  {
    rootMargin: '0px 0px 200px 0px',
    threshold: 1.0,
  }
);

const handleFormUtils = {
  getImages: function (event) {
    event.preventDefault();
    page = 1;
    markup = '';
    refs.galleryCards.innerHTML = '';
    searchTerm = '';
    if (`${refs.form['searchQuery'].value}` !== '') {
      searchTerm = `${refs.form['searchQuery'].value}`;
    }
    layoutUtils.refreshImagesList(searchTerm, page, RESULTS_PER_PAGE);
  },
};

refs.form.addEventListener('submit', handleFormUtils.getImages);

const layoutUtils = {
  renderImages: function (images) {
    markup += images
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return `
      <div class="photo-card">
      <a class="gallery__item" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="270" height="180" />
  </a>
  <div class="info">
    <p class="info-item">
      <b><span>Likes</span></br>${likes}</b>
    </p>
    <p class="info-item">
      <b><span>Views</span></br>${views}</b>
    </p>
    <p class="info-item">
      <b><span>Comments</span></br>${comments}</b>
    </p>
    <p class="info-item">
      <b><span>Downloads</span></br>${downloads}</b>
    </p>
  </div>
</div>
      `;
        }
      )
      .join('');
    refs.galleryCards.innerHTML = markup;
    let lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    if (page < totalPages) {
      if (lastImage) {
        observer.unobserve(lastImage);
      }
      const imagesOnScreen = document.querySelectorAll('.gallery .photo-card');
      lastImage = imagesOnScreen[imagesOnScreen.length - 1];
      observer.observe(lastImage);
    }
    if (page > totalPages) {
      setTimeout(() => {
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }, DELAY);
    }
  },

  refreshImagesList: function (searchTerm, page, RESULTS_PER_PAGE) {
    services.getImages(searchTerm, page, RESULTS_PER_PAGE).then(images => {
      if (images.data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      if (page === 1) {
        Notify.success(`Hooray! We found ${images.data.totalHits} images.`);
        totalImages = images.data.totalHits;
        totalPages = totalImages / RESULTS_PER_PAGE;
      }
      return this.renderImages(images.data.hits);
    });
  },
};
