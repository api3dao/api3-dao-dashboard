/**
 * Use this to bypass eslint rule checking if all hook dependencies are used.
 * You might want to execute your hook on some value not directly
 * used in code (e.g. blockNumber)
 *
 * This function is noop, and will be removed from production bundle.
 */
// TODO: verify that it is eliminated from production bundle
export const unusedHookDependency = (..._args: any[]) => {};
