// @ts-check
import i18next from 'i18next';
import App from './app';
import rssParser from './rssParser';

export default () => {
  const i18nextInstance = i18next.createInstance();
  const initialState = {
    form: {
      valid: true,
      error: null,
    },
    feeds: [],
    posts: [],
    modal: {
      postId: null,
    },
    loadingStatus: '',
  };

  new App(initialState, rssParser, i18nextInstance).start();
};
