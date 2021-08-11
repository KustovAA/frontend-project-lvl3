import onChange from 'on-change';

export default class WatchedState {
  constructor(initialState, elements, i18next) {
    this.elements = elements;
    this.i18next = i18next;
    this.watchedState = onChange(initialState, (path) => {
      switch (path) {
        case 'form':
          this.handleForm();
          break;
        case 'feeds':
          this.handleFeeds();
          break;
        case 'posts':
          this.handlePosts();
          break;
        case 'modal':
          this.handleModal();
          break;
        case 'loading':
          this.handleLoading();
          break;
        default:
          break;
      }
    });
  }

  handleForm() {
    const { error, valid } = this.state.form;

    if (valid) {
      this.elements.input.classList.remove('is-invalid');
      this.elements.feedback.classList.remove('text-danger');
      this.elements.feedback.classList.add('text-success');
      this.elements.feedback.innerHTML = '';
      this.elements.form.reset();
      this.elements.input?.focus();
      return;
    }

    this.elements.input.classList.add('is-invalid');
    this.elements.feedback.classList.add('text-danger');
    this.elements.feedback.classList.remove('text-success');
    this.elements.feedback.innerHTML = this.i18next.t(error);
  }

  handleFeeds() {
    const { feeds } = this.state;
    const feedsContainer = document.createElement('div');
    feedsContainer.classList.add('card');
    feedsContainer.classList.add('border-0');
    feedsContainer.innerHTML = `
            <div class="card border-0">
                <div class="card-body">
                    <h2 class="card-title h4">Фиды</h2>
                </div>
            </div>
        `;
    const feedsList = document.createElement('ul', { classList: ['', '', ''] });
    feedsList.classList.add('list-group');
    feedsList.classList.add('border-0');
    feedsList.classList.add('rounded-0');
    feeds.forEach((feed) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item');
      item.classList.add('border-0');
      item.classList.add('border-end-0');
      item.innerHTML = `
                    <h3 class="h6 m-0">${feed.title}</h3>
                    <p class="m-0 small text-black-50">${feed.description}</p>
            `;
      feedsList.append(item);
    });
    feedsContainer.append(feedsList);
    this.elements.feedsContainer.innerHTML = feedsContainer.outerHTML;
  }

  handlePosts() {
    const { posts } = this.state;
    const postsContainer = document.createElement('div');
    postsContainer.classList.add('card');
    postsContainer.classList.add('border-0');
    postsContainer.innerHTML = `
            <div class="card border-0">
                <div class="card-body">
                    <h2 class="card-title h4">Посты</h2>
                </div>
            </div>
        `;
    const postsList = document.createElement('ul', { classList: ['list-group', 'border-0', 'rounded-0'] });
    postsList.classList.add('list-group');
    postsList.classList.add('border-0');
    postsList.classList.add('rounded-0');
    posts.forEach((post) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item');
      item.classList.add('d-flex');
      item.classList.add('justify-content-between');
      item.classList.add('align-items-start');
      item.classList.add('border-0');
      item.classList.add('border-end-0');
      item.innerHTML = `
                <a href="${post.link}" class="fw-bold" data-id="${post.id}" target="_blank" rel="noopener noreferrer">
                    ${post.title}
                </a>
                <button type="button" class="btn btn-outline-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">
                    Просмотр
                </button>
            `;

      postsList.append(item);
    });
    postsContainer.append(postsList);
    this.elements.postsContainer.innerHTML = postsContainer.outerHTML;
  }

  handleModal() {
    const { modal: { postId }, posts } = this.state;

    if (postId === null) {
      document.body.querySelector('.modal-title').textContent = '';
      document.body.querySelector('.modal-body').textContent = '';
      document.body.querySelector('.full-article').setAttribute('href', '#');
    }

    const post = posts.find((p) => p.id === postId);

    if (!post) {
      return;
    }

    document.body.querySelector('.modal-title').textContent = post.title;
    document.body.querySelector('.modal-body').textContent = post.description;
    document.body.querySelector('.full-article').setAttribute('href', post.link);
  }

  handleLoading() {
    const { status, error } = this.state.loading;

    if (status === 'success') {
      this.elements.submit.disabled = false;
      this.elements.input.removeAttribute('readonly');
      this.elements.input.classList.remove('is-invalid');
      this.elements.feedback.classList.remove('text-danger');
      this.elements.feedback.classList.add('text-success');
      this.elements.feedback.innerHTML = this.i18next.t('loading.status.success');
      console.warn(this.i18next.t('loading.status.success'));
      return;
    }

    if (status === 'loading') {
      this.elements.submit.disabled = true;
      this.elements.input.setAttribute('readonly', true);
      this.elements.input.classList.remove('is-invalid');
      this.elements.feedback.classList.remove('text-danger');
      this.elements.feedback.classList.remove('text-success');
      this.elements.feedback.innerHTML = '';
    }

    if (status === 'fail') {
      this.elements.submit.disabled = false;
      this.elements.input.removeAttribute('readonly');
      this.elements.input.classList.add('is-invalid');
      this.elements.feedback.classList.add('text-danger');
      this.elements.feedback.classList.remove('text-success');
      this.elements.feedback.innerHTML = this.i18next.t(error);
    }
  }

  get state() {
    return this.watchedState;
  }
}
