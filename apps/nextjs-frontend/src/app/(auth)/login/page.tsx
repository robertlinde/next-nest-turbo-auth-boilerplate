'use client';

import {useState, type JSX} from 'react';
import {LoginCredentials} from './components/LoginCredentials/LoginCredentials.component.tsx';
import {LoginTwoFactor} from './components/LoginTwoFactor/LoginTwoFactor.component.tsx';

export default function Login(): JSX.Element {
  const [tab, setTab] = useState<'credentials' | '2fa'>('credentials');

  return tab === 'credentials' ? (
    <LoginCredentials
      handleLoginCredentialsSuccess={() => {
        setTab('2fa');
      }}
    />
  ) : (
    <LoginTwoFactor />
  );
}
