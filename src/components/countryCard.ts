import type { Country } from '../types/index';

const numberFormatter = new Intl.NumberFormat('ru-RU');

export function createCountryCard(
  country: Country,
  onSelect: (country: Country) => void,
): HTMLElement {
  const card = document.createElement('article');
  card.className = 'country-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Подробнее о стране ${country.name}`);

  const flagImg = document.createElement('img');
  flagImg.className = 'country-card__flag';
  flagImg.src = country.flagUrl;
  flagImg.alt = `Флаг: ${country.name}`;
  flagImg.loading = 'lazy';

  const body = document.createElement('div');
  body.className = 'country-card__body';

  const title = document.createElement('h2');
  title.className = 'country-card__title';
  title.textContent = country.name;

  const metaList = document.createElement('dl');
  metaList.className = 'country-card__meta';

  const addMetaRow = (label: string, value: string): void => {
    const row = document.createElement('div');
    row.className = 'country-card__meta-row';

    const dt = document.createElement('dt');
    dt.textContent = label;

    const dd = document.createElement('dd');
    dd.textContent = value;

    row.append(dt, dd);
    metaList.append(row);
  };

  addMetaRow('Столица:', country.capital);
  addMetaRow('Регион:', country.region);
  addMetaRow('Население:', numberFormatter.format(country.population));

  body.append(title, metaList);
  card.append(flagImg, body);

  card.addEventListener('click', () => {
    onSelect(country);
  });

  card.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(country);
    }
  });

  return card;
}
