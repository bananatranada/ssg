import moment from 'moment';
import dateformat from 'dateformat';

const currentYear = new Date().getFullYear();
console.log(currentYear);

const blogListDateEls = document.getElementsByClassName('blog-list-date');
for (let i = 0; i < blogListDateEls.length; i++) {
  const el = blogListDateEls[i];
  const postDate = new Date(el.innerText);
  const postYear = postDate.getFullYear();
  if (postYear !== currentYear) {
    continue;
  }
  el.innerText = dateformat(postDate, 'm/d');
  // if (date.get(''))
  console.log(el.innerText);
  console.log(new Date(el.innerText).getFullYear());
}
