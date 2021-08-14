/**
 * We want to use `noUncheckedIndexedAccess`by TSC to be strict about array and object access. This is especially
 * useful, because the app only stores data that is necessary for the current page. For example, when browsing proposal
 * details only a single proposal is fetched. It is easy to forget this and expect some part of the state to be already
 * present.
 *
 * Unfortunately, this check doesn't play nice with css modules and typings provided by CRA. The fix is to use more
 * loose checks which avoid violations for this rule. This doesn't degrade typing results in any way, because we use css
 * modules TS plugin for IDE (so we have full type inference there).
 *
 * NOTE: It's possible (but unlikely) that the module typings change, filename changes or react-scripts end up installed
 * somewhere else. These cases are unfortunately, out of scope.
 */
const { bold, green } = require('chalk');
const { promiseWrapper, replaceAndLog } = require('./utils');

const TEXT_TO_REMOVE = `
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
`;

const main = async () => {
  const options = {
    files: './node_modules/react-scripts/lib/react-app.d.ts',
    from: TEXT_TO_REMOVE,
    to: '',
    dry: false,
  };

  console.info(bold(green('Fixing scss TS typings...')));
  await replaceAndLog(options);
};

promiseWrapper(main);
