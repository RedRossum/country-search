export function createLoadingView(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-view state-view--loading';
  wrapper.setAttribute('role', 'status');
  wrapper.setAttribute('aria-live', 'polite');

  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const text = document.createElement('p');
  text.textContent = 'Загрузка данных о странах...';

  wrapper.append(spinner, text);
  return wrapper;
}

export function createEmptyView(query: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-view state-view--empty';
  wrapper.setAttribute('role', 'status');

  const title = document.createElement('h2');
  title.textContent = 'Ничего не найдено';

  const subtitle = document.createElement('p');
  subtitle.textContent = `По запросу «${query.trim()}» совпадений не обнаружено. Проверьте написание на английском языке (например, Spain, Germany, Japan).`;

  wrapper.append(title, subtitle);
  return wrapper;
}

export function createErrorView(message: string, onRetry: () => void): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-view state-view--error';
  wrapper.setAttribute('role', 'alert');

  const title = document.createElement('h2');
  title.textContent = 'Не удалось загрузить данные';

  const description = document.createElement('p');
  description.textContent = message;

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.className = 'btn btn--retry';
  retryButton.textContent = 'Повторить';
  retryButton.addEventListener('click', onRetry);

  wrapper.append(title, description, retryButton);
  return wrapper;
}

export function createIdleView(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-view state-view--idle';

  const text = document.createElement('p');
  text.textContent = 'Введите название страны на английском языке для начала поиска.';

  wrapper.append(text);
  return wrapper;
}
