/**
 * Aragon voting contracts are flexible but this makes it a bit harder to work with its contracts. We have created a
 * simple encoding and decoding scheme (convention) for the API3 proposals. The implementation of these utilities is
 * inspired by https://github.com/bbenligiray/proposal-test.
 *
 * Check out the documentation in the source files for more documentation and details.
 */
export * from './encoding';
export * from './metadata';
export * from './proposal-id';
export * from './types';
