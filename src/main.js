import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');
const inlineLoader = loadMoreBtn.querySelector('.loader');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = e.target.elements['search-text'].value.trim();
  if (!query) {
    iziToast.warning({ message: 'Please enter a search term' });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({ message: 'No results found. Try again!' });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(totalHits / 15);
    if (page >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }
  } catch (err) {
    iziToast.error({ message: 'Failed to fetch images' });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  loadMoreBtn.disabled = true;
  inlineLoader.classList.add('visible');

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    setTimeout(scrollSmoothly, 0);

    const totalPages = Math.ceil(totalHits / 15);
    if (page >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (err) {
    console.error('Load more error:', err);
    iziToast.error({ message: 'Something went wrong' });
  } finally {
    inlineLoader.classList.remove('visible');
    loadMoreBtn.disabled = false;
  }
});

function scrollSmoothly() {
  const card = document.querySelector('.gallery-item');
  if (!card) return;

  const cardHeight = card.getBoundingClientRect().height;
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}