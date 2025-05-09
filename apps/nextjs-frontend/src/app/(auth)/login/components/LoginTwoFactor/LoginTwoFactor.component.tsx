'use client';

import {type JSX} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation';
import {Button} from 'primereact/button';
import {useForm, type SubmitHandler} from 'react-hook-form';

import {type LoginTwoFactorFormFields} from './types/login-two-factor-form-fields.type';
import {loginTwoFactorSchema} from './types/login-two-factor.schema';

import {FloatLabelInputText} from '@/components/FloatLabelInputText/FloatLabelInputText.component';

import {useAuthApi} from '@/hooks/useAuthApi/useAuthApi';
import {useToast} from '@/hooks/useToast/useToast';
import {type ApiError} from '@/utils/api/api-error';

export const LoginTwoFactor = (): JSX.Element => {
  const {showToast} = useToast();

  const router = useRouter();
  const {loginTwoFactor} = useAuthApi();
  const {
    register: register2fa,
    handleSubmit: handleSubmit2fa,
    setError: setError2fa,
    reset: reset2fa,
    formState: {errors: errors2fa, isSubmitting: isSubmitting2fa},
  } = useForm<LoginTwoFactorFormFields>({resolver: zodResolver(loginTwoFactorSchema)});

  const onSubmit2fa: SubmitHandler<LoginTwoFactorFormFields> = async (data) => {
    await loginTwoFactor({
      data,
      onSuccess() {
        reset2fa();
        showToast({
          severity: 'success',
          summary: 'Login successful',
        });
        router.push('/');
      },
      onError(error: ApiError) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError2fa('root', {message: 'Invalid two-factor authentication code or code expired'});
        } else if (error.response.status === 500) {
          setError2fa('root', {message: 'Something went wrong'});
        } else {
          setError2fa('root', {message: 'An unknown error occurred'});
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2>Please enter your 2FA code</h2>
      <p className="mt-6 md:mt-10 lg:mt-12">
        We have sent a 2FA code to your email. Please enter it below to continue. If you can't find the email, please
        check your spam folder.
      </p>
      <form
        onSubmit={handleSubmit2fa(onSubmit2fa)}
        className="mt-4 flex flex-col items-center gap-4 md:mt-6 md:gap-6 lg:mt-8 lg:gap-8"
      >
        <FloatLabelInputText {...register2fa('code')} maxLength={6} label="Code" />
        {errors2fa.code && <p className="text-red-700">{errors2fa.code.message}</p>}
        <Button label={isSubmitting2fa ? 'Loading ...' : 'Confirm'} type="submit" disabled={isSubmitting2fa} />
        {errors2fa.root && <p className="text-red-700">{errors2fa.root.message}</p>}
      </form>
    </div>
  );
};
