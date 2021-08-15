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
        case 'seenPosts':
          this.handleSeenPosts();
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
                    <h2 class="card-title h4">${this.i18next.t('feeds')}</h2>
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
      const itemTitle = document.createElement('h3');
      itemTitle.classList.add('h6', 'm-0');
      itemTitle.textContent = feed.title;
      const itemDescription = document.createElement('p');
      itemDescription.classList.add('m-0', 'small', 'text-black-50');
      itemDescription.textContent = feed.description;
      item.append(itemTitle);
      item.append(itemDescription);
      feedsList.append(item);
    });
    feedsContainer.append(feedsList);
    this.elements.feedsContainer.innerHTML = feedsContainer.outerHTML;
  }

  handlePosts() {
    const { posts, seenPosts } = this.state;
    const postsContainer = document.createElement('div');
    postsContainer.classList.add('card');
    postsContainer.classList.add('border-0');
    postsContainer.innerHTML = `
            <div class="card border-0">
                <div class="card-body">
                    <h2 class="card-title h4">${this.i18next.t('posts')}</h2>
                </div>
            </div>
        `;
    const postsList = document.createElement('ul', { classList: ['list-group', 'border-0', 'rounded-0'] });
    postsList.classList.add('list-group');
    postsList.classList.add('border-0');
    postsList.classList.add('rounded-0');
    posts.forEach((post) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const itemLink = document.createElement('a');
      itemLink.setAttribute('href', post.link);
      const linkClasses = seenPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
      itemLink.classList.add(...linkClasses);
      itemLink.dataset.id = post.id;
      itemLink.textContent = post.title;
      itemLink.setAttribute('target', '_blank');
      itemLink.setAttribute('rel', 'noopener noreferrer');
      item.appendChild(itemLink);
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.id = post.id;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = this.i18next.t('view');
      item.appendChild(button);

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
      this.elements.form.reset();
      this.elements.input?.focus();
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

  handleSeenPosts() {
    const { seenPosts } = this.state;
    Array.from(seenPosts).forEach((id) => {
      const link = document.body.querySelector(`a[data-id='${id}'`);

      if (link) {
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal');
        link.classList.add('link-secondary');
      }
    });
  }

  get state() {
    return this.watchedState;
  }
}
