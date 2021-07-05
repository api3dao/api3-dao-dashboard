// Images list here will also be prefetched in the document head
export const images = {
  api3LogoDark: '/api3-logo-dark.svg',
  api3LogoWhite: '/api3-logo-white.svg',
  apiIcon: '/api-icon.svg',
  arrowDropdown: '/arrow-dropdown.svg',
  arrowDropdownDark: '/arrow-dropdown-dark.svg',
  arrowLeft: '/arrow-left.svg',
  arrowRight: '/arrow-right.svg',
  checkboxEmpty: '/checkbox-empty.svg',
  checkboxFilled: '/checkbox-filled.svg',
  checkBlack: '/check-black.svg',
  checkGreen: '/check-green.svg',
  close: '/close.svg',
  closePink: '/close-pink.svg',
  connected: '/connected.svg',
  connectedDark: '/connected-dark.svg',
  dropdown: '/dropdown.svg',
  error: '/error.svg',
  externalLink: '/external-link.svg',
  hamburgerMenu: '/hamburger-menu.svg',
  help: '/help.svg',
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
  unsupportedNetwork: '/unsupported-network.svg',
};

// We only want to 'preload' certain images that will definitely be displayed immediately.
// All other images are fetched with 'prefetch'. Preloading too many resources can be
// a net negative for performance.
// https://www.debugbear.com/blog/rel-preload-problems
export const preloadImageList = [images.api3LogoWhite, images.api3LogoDark];
