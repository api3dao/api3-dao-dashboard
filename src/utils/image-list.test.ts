import { images } from './image-list';

test('messages', () => {
  expect(images).toEqual({
    api3LogoDark: '/api3-logo-dark.svg',
    api3LogoWhite: '/api3-logo-white.svg',
    apiIcon: '/api-icon.svg',
    arrowDown: '/arrow-down.svg',
    arrowDropdown: '/arrow-dropdown.svg',
    arrowDropdownDark: '/arrow-dropdown-dark.svg',
    arrowRight: '/arrow-right.svg',
    checkGreen: '/check-green.svg',
    close: '/close.svg',
    closePink: '/close-pink.svg',
    connected: '/connected.svg',
    connectedDark: '/connected-dark.svg',
    dropdown: '/dropdown.svg',
    error: '/error.svg',
    hamburgerMenu: '/hamburger-menu.svg',
    info: '/info.svg',
    menuClose: '/menu-close.svg',
    notificationClose: '/notification-close.svg',
    success: '/success.svg',
    texture: '/texture.png',
    triangleBracketLeft: '/triangle-bracket-left.svg',
    triangleBracketLeftMobile: '/triangle-bracket-left-mobile.svg',
    triangleBracketRight: '/triangle-bracket-right.svg',
    triangleBracketRightMobile: '/triangle-bracket-right-mobile.svg',
    triangles: '/triangles.svg',
    votedAgainst: '/voted-against.svg',
    votedFor: '/voted-for.svg',
    warning: '/warning.svg',
  });
});
