import 'bootstrap/js/src/alert';
import 'bootstrap/js/src/button';
import 'bootstrap/js/src/carousel';
import 'bootstrap/js/src/collapse';
import 'bootstrap/js/src/dropdown';
import 'bootstrap/js/src/modal';
import 'bootstrap/js/src/popover';
import 'bootstrap/js/src/scrollspy';
import 'bootstrap/js/src/tab';
import 'bootstrap/js/src/tooltip';

$('.popup__button').click((e) => {
  e.preventDefault();
  $('.popup__content').css('display', 'block');
  setTimeout(() => $('.popup__content').addClass('popup__content--active'), 0)
});
