import './style.css';
import { createCountryCard } from './components/countryCard';
import { createCountryModal } from './components/countryModal';
import {
  createEmptyView,
  createErrorView,
  createIdleView,
  createLoadingView,
} from './components/statusViews';
import { createSearchController } from './core/createSearchController';
import { loadSearchHistory, saveSearchQuery } from './core/searchHistory';
import type { SearchState } from './types/index';

function bootstrapApp(): void {
  const root = document.getElementById('app');
  if (!root) {
    return;
  }

  const controller = createSearchController();
  const modal = createCountryModal();

  const container = document.createElement('main');
  container.className = 'app-container';

  const header = document.createElement('header');
  header.className = 'app-header';

  const title = document.createElement('h1');
  title.className = 'app-title';
  title.textContent = 'Поиск стран мира';

  const subtitle = document.createElement('p');
  subtitle.className = 'app-subtitle';
  subtitle.textContent =
    'Введите название страны на английском языке, чтобы получить актуальную сводку';

  header.append(title, subtitle);

  const searchSection = document.createElement('section');
  searchSection.className = 'search-section';

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'search-box';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'search-box__input';
  searchInput.placeholder = 'Например: Spain, Germany, Japan...';
  searchInput.setAttribute('aria-label', 'Название страны');
  searchInput.autocomplete = 'off';

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'search-box__clear';
  clearButton.textContent = 'Очистить';
  clearButton.hidden = true;

  inputWrapper.append(searchInput, clearButton);

  const historyContainer = document.createElement('div');
  historyContainer.className = 'search-history';

  searchSection.append(inputWrapper, historyContainer);

  const resultsSection = document.createElement('section');
  resultsSection.className = 'results-section';

  container.append(header, searchSection, resultsSection);
  root.replaceChildren(container, modal.element);

  const renderHistory = (items: string[]): void => {
    if (items.length === 0) {
      historyContainer.replaceChildren();
      return;
    }

    const label = document.createElement('span');
    label.className = 'search-history__label';
    label.textContent = 'Недавние запросы:';

    const list = document.createElement('div');
    list.className = 'search-history__list';

    items.forEach((queryItem) => {
      const tagBtn = document.createElement('button');
      tagBtn.type = 'button';
      tagBtn.className = 'search-history__tag';
      tagBtn.textContent = queryItem;
      tagBtn.addEventListener('click', () => {
        searchInput.value = queryItem;
        clearButton.hidden = false;
        controller.handleInput(queryItem);
      });
      list.append(tagBtn);
    });

    historyContainer.replaceChildren(label, list);
  };

  const renderState = (state: SearchState): void => {
    clearButton.hidden = state.query.length === 0;

    switch (state.status) {
      case 'idle': {
        resultsSection.replaceChildren(createIdleView());
        break;
      }
      case 'loading': {
        resultsSection.replaceChildren(createLoadingView());
        break;
      }
      case 'empty': {
        resultsSection.replaceChildren(createEmptyView(state.query));
        break;
      }
      case 'error': {
        const message = state.errorMessage ?? 'Произошла неизвестная ошибка.';
        resultsSection.replaceChildren(
          createErrorView(message, () => {
            controller.retry();
          }),
        );
        break;
      }
      case 'success': {
        const updatedHistory = saveSearchQuery(state.query);
        renderHistory(updatedHistory);

        const grid = document.createElement('div');
        grid.className = 'countries-grid';

        const cards = state.countries.map((country) =>
          createCountryCard(country, (selectedCountry) => {
            modal.open(selectedCountry);
          }),
        );

        grid.append(...cards);
        resultsSection.replaceChildren(grid);
        break;
      }
    }
  };

  controller.subscribe(renderState);

  searchInput.addEventListener('input', () => {
    controller.handleInput(searchInput.value);
  });

  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    controller.clear();
  });

  renderHistory(loadSearchHistory());
  renderState(controller.getState());
}

bootstrapApp();
