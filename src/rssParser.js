// @ts-check
const rssParser = (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');

  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isRssError = true;
    throw error;
  }

  const title = dom.querySelector('channel > title')?.textContent;
  const description = dom.querySelector('channel > description')?.textContent;
  const itemElements = dom.querySelectorAll('item');
  const items = [...itemElements].map((el) => ({
    title: el.querySelector('title')?.textContent,
    link: el.querySelector('link')?.textContent,
    description: el.querySelector('description')?.textContent,
  }));

  return { title, description, items };
};

export default rssParser;
