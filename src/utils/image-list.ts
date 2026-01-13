// Images list here will also be prefetched in the document head
export const images = {
  api3DaoLogoDarkTheme: './api3-dao-logo-dark-theme.svg',
  api3DaoLogoLightTheme: './api3-dao-logo-light-theme.svg',
  arrowDropdown: './arrow-dropdown.svg',
  arrowLeft: './arrow-left.svg',
  arrowRight: './arrow-right.svg',
  checkboxEmpty: './checkbox-empty.svg',
  checkboxFilled: './checkbox-filled.svg',
  checkBlack: './check-black.svg',
  close: './close.svg',
  connected: './connected.svg',
  connectedDark: './connected-dark.svg',
  disconnect: './disconnect.svg',
  externalLink: './external-link.svg',
  hamburgerMenu: './hamburger-menu.svg',
  helpOutline: './help-outline.svg',
  infoCircle: './info-circle.svg',
  notFound: './not-found.svg',
  walletDisconnected: './wallet-disconnected.svg',
};

// We only want to 'preload' certain images that will definitely be displayed immediately.
// All other images are fetched with 'prefetch'. Preloading too many resources can be
// a net negative for performance.
// https://www.debugbear.com/blog/rel-preload-problems
export const preloadImageList = [images.api3DaoLogoDarkTheme, images.api3DaoLogoLightTheme];
