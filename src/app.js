// @ts-check
import { string, setLocale } from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import differenceWith from 'lodash/differenceWith';
import WatchedState from './watcher';

const withProxy = (url) => {
  const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';
  const proxyfiedUrl = new URL('/get', proxyUrl);
  proxyfiedUrl.searchParams.set('url', url);
  proxyfiedUrl.searchParams.set('disableCache', 'true');
  return proxyfiedUrl.toString();
};

const updateRssTimeout = 5000;

export default class App {
  constructor(initialState, parser, i18nextInstance) {
    this.parser = parser;
    this.i18nextInstance = i18nextInstance;
    this.elements = {
      form: document.body.querySelector('#rss-form'),
      input: document.body.querySelector('#rss-input'),
      submit: document.body.querySelector('#rss-submit'),
      feedback: document.body.querySelector('.feedback'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),
    };
    this.watchedState = new WatchedState(initialState, this.elements, this.i18nextInstance);
    setLocale({
      string: {
        url: () => ({ key: 'errors.url' }),
      },
    });
    this.formValidationSchema = string().url().required();
  }

  start() {
    this.i18nextInstance.init({
      lng: 'ru',
      debug: false,
      resources: {
        ru: {
          translation: {
            errors: {
              url: 'Ссылка должна быть валидным URL',
              noRss: 'Ресурс не содержит валидный RSS',
            },
            loadingStatus: {
              success: 'RSS успешно загружен',
            }
          },
        },
      },
    }).then(this.initListenrs.bind(this));
  }

  initListenrs() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fd = new FormData(e.target);
      const url = fd.get('url');

      this.validateForm(url).then((error) => this.handleFormValidation(error, url));
    });
    this.elements.postsContainer.addEventListener('click', (e) => {
      if (!('id' in e.target.dataset)) {
        return;
      }

      this.watchedState.state.modal = {
        ...this.watchedState.state.modal,
        postId: String(e.target.dataset.id),
      };
    });
  }

  handleFormValidation(error, url) {
    if (error) {
      this.watchedState.state.form = {
        ...this.watchedState.state.form,
        valid: false,
        error: error.key,
      };
      return;
    }

    this.watchedState.state.form = {
      ...this.watchedState.state.form,
      valid: true,
      error: null,
    };
    this.loadRss(url);
  }

  validateForm(url) {
    return this.formValidationSchema
      .validate(url)
      .then(() => null)
      .catch((e) => e.message);
  }

  loadRss(url) {
    axios.get(withProxy(url)).then((res) => {
      const { title, description, items } = this.parser(res.data.contents);
      const feed = {
        title, description, url, id: uniqueId(),
      };
      this.watchedState.state.feeds = [feed, ...this.watchedState.state.feeds];
      this.watchedState.state.posts = [
        ...items.map((item) => ({ ...item, feedId: feed.id, id: uniqueId() })),
        ...this.watchedState.state.posts,
      ];
      this.watchedState.state.loadingStatus = 'success';
    }).then(() => {
      setTimeout(() => this.updateRss(), updateRssTimeout);
    }).catch((e) => {
      
    });
  }

  updateRss() {
    const { feeds } = this.watchedState.state;
    const updatePromises = feeds.map((feed) => axios.get(withProxy(feed.url)).then((res) => {
      const { items } = this.parser(res.data.contents);
      const posts = this.watchedState.state.posts.filter((post) => post.feedId === feed.id);
      const newPosts = items.map((item) => ({ ...item, feedId: feed.id, id: uniqueId() }));
      this.watchedState.state.posts = [
        ...differenceWith(posts, newPosts, (p, np) => p.title === np.title),
        ...this.watchedState.state.posts,
      ];
    }).catch((e) => console.error(e)));

    Promise.all(updatePromises).finally(() => {
      setTimeout(() => this.updateRss(), updateRssTimeout);
    });
  }
}
