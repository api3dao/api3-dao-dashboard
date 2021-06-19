import { images } from './image-list';

test('messages', () => {
  expect(images).toEqual({
    'api3-logo-dark': '/api3-logo-dark.svg',
    'api3-logo-white': '/api3-logo-dark.svg',
    'api-icon': '/api-icon.svg',
    'arrow-down': '/arrow-down.svg',
    'arrow-dropdown': '/arrow-dropdown.svg',
    'arrow-dropdown-dark': '/arrow-dropdown-dark.svg',
    'arrow-right': '/arrow-right.svg',
    'check-green': '/check-green.svg',
    close: '/close.svg',
    'close-pink': '/close-pink.svg',
    connected: '/connected.svg',
    'connected-dark': '/connected-dark.svg',
    dropdown: '/dropdown.svg',
    error: '/error.svg',
    'hamburger-menu': '/hamburger-menu.svg',
    info: '/info.svg',
    'menu-close': '/menu-close.svg',
    'notification-close': '/notification-close.svg',
    success: '/success.svg',
    texture: '/texture.png',
    'triangle-bracket-left': '/triangle-bracket-left.svg',
    'triangle-bracket-left-mobile': '/triangle-bracket-left-mobile.svg',
    'triangle-bracket-right': '/triangle-bracket-right.svg',
    'triangle-bracket-right-mobile': '/triangle-bracket-right-mobile.svg',
    triangles: '/triangles.svg',
    'voted-against': '/voted-against.svg',
    'voted-for': '/voted-for.svg',
    warning: '/warning.svg',
  });
});
