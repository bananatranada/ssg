import moment from 'moment';

const currentYear = new Date().getFullYear();

const blogListDateEls = document.getElementsByClassName('js-simplify-date');
for (let i = 0; i < blogListDateEls.length; i++) {
  const el = blogListDateEls[i];
  const date = moment(el.innerText);
  if (date.get('year') !== currentYear) {
    el.innerText = date.format('M/D/YY');
  } else {
    el.innerText = date.format('M/D');
  }
}

const updatedDateEls = document.getElementsByClassName(
  'js-simplify-updated-date'
);
for (let i = 0; i < updatedDateEls.length; i++) {
  const el = updatedDateEls[i];

  const date = moment(el.innerText);
  el.innerText = 'Updated ' + date.fromNow();
  console.log('Updated ' + date.fromNow());
}

const createdDateEls = document.getElementsByClassName(
  'js-simplify-created-date'
);
for (let i = 0; i < createdDateEls.length; i++) {
  const el = createdDateEls[i];

  const date = moment(el.innerText);
  el.innerText = 'Created ' + date.fromNow();
  console.log('Updated ' + date.fromNow());
}
