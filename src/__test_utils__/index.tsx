import { render as baseRender, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { createMockClient } from './mock-wagmi-client';

export { act, fireEvent, renderHook, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

const wagmiClient = createMockClient();

export const render = (ui: ReactElement, options?: RenderOptions): RenderResult => {
  return baseRender(
    <BrowserRouter>
      <WagmiConfig config={wagmiClient}>{ui}</WagmiConfig>
    </BrowserRouter>,
    options
  );
};
