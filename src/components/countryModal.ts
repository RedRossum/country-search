import type { Country } from '../types/index';

const numberFormatter = new Intl.NumberFormat('ru-RU');

export interface CountryModalController {
  element: HTMLDialogElement;
  open: (country: Country) => void;
  close: () => void;
}

export function createCountryModal(): CountryModalController {
  const dialog = document.createElement('dialog');
  dialog.className = 'country-modal';

  const content = document.createElement('div');
  content.className = 'country-modal__content';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'country-modal__close';
  closeBtn.textContent = 'Закрыть';
  closeBtn.setAttribute('aria-label', 'Закрыть окно');

  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'country-modal__details';

  content.append(closeBtn, detailsContainer);
  dialog.append(content);

  const close = (): void => {
    if (dialog.open) {
      dialog.close();
    }
  };

  closeBtn.addEventListener('click', close);

  dialog.addEventListener('click', (event: MouseEvent) => {
    if (event.target === dialog) {
      close();
    }
  });

  const open = (country: Country): void => {
    const flagImg = document.createElement('img');
    flagImg.className = 'country-modal__flag';
    flagImg.src = country.flagUrl;
    flagImg.alt = `Флаг: ${country.name}`;

    const heading = document.createElement('h2');
    heading.className = 'country-modal__title';
    heading.textContent = country.name;

    const summary = document.createElement('p');
    summary.className = 'country-modal__summary';
    summary.textContent = `${country.name} — государство в регионе ${country.region} (${country.subregion}) со столицей в городе ${country.capital}.`;

    const list = document.createElement('dl');
    list.className = 'country-modal__list';

    const appendRow = (term: string, description: string): void => {
      const row = document.createElement('div');
      row.className = 'country-modal__row';

      const dt = document.createElement('dt');
      dt.textContent = term;

      const dd = document.createElement('dd');
      dd.textContent = description;

      row.append(dt, dd);
      list.append(row);
    };

    appendRow('Столица:', country.capital);
    appendRow('Регион / Субрегион:', `${country.region} / ${country.subregion}`);
    appendRow('Население:', `${numberFormatter.format(country.population)} чел.`);
    appendRow(
      'Площадь:',
      country.area > 0 ? `${numberFormatter.format(country.area)} км²` : 'Нет данных',
    );
    appendRow('Языки:', country.languages.length > 0 ? country.languages.join(', ') : 'Нет данных');
    appendRow(
      'Валюты:',
      country.currencies.length > 0 ? country.currencies.join(', ') : 'Нет данных',
    );
    appendRow(
      'Границы (коды ISO):',
      country.borders.length > 0 ? country.borders.join(', ') : 'Нет сухопутных границ',
    );

    detailsContainer.replaceChildren(flagImg, heading, summary, list);
    dialog.showModal();
  };

  return {
    element: dialog,
    open,
    close,
  };
}
