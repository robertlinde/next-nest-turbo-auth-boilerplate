import {expect} from '@playwright/test';
import {login} from './utils/login/login.ts';
import {register} from './utils/register/register.ts';
import {test} from './utils/setup.ts';

test.describe('Edit profile', () => {
  test('should change username', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    const newUsername = `new-${Date.now().toString().slice(0, 8)}`;

    await page.getByTestId('profile-username-input').fill(newUsername);
    await page.getByTestId('profile-save-button').click();

    await page.getByText('Yes').click();

    // Assert that the username has been changed
    await expect(page.getByText('Profile update successful')).toBeVisible();
    await expect(page.getByText(`Hey, ${newUsername}`)).toBeVisible();
  });

  test('should show error when username is empty', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    await page.getByTestId('profile-username-input').fill('');
    await page.getByTestId('profile-save-button').click();

    // Assert that the error message is shown
    await expect(page.getByText('Username must be at least 4 characters long')).toBeVisible();
  });

  test('should change email', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    const newEmail = `new-${Date.now().toString().slice(0, 8)}@playwright.test`;

    await page.getByTestId('profile-email-input').fill(newEmail);
    await page.getByTestId('profile-save-button').click();

    await page.getByText('Yes').click();

    await page.getByTestId('profile-logout-button').click();

    // Wait for logout to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Validate that the old email cannot be used to login
    await login(
      page,
      {
        email: user.email,
        password: user.password,
      },
      {
        expectCredentialsError: true,
      },
    );

    // Clear any error state before trying new credentials
    await page.waitForLoadState('networkidle');

    await login(page, {
      email: newEmail,
      password: user.password,
    });
  });

  test('should show error when email is empty', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    await page.getByTestId('profile-email-input').fill('');
    await page.getByTestId('profile-save-button').click();

    // Assert that the error message is shown
    await expect(page.getByText('Invalid email')).toBeVisible();
  });

  test('should change password', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    const newPassword = 'NewStrongPassword123!';

    await page.getByTestId('profile-password-input').fill(newPassword);
    await page.getByTestId('profile-save-button').click();

    await page.getByText('Yes').click();

    // Assert that the password has been changed
    await expect(page.getByText('Profile update successful')).toBeVisible();

    // Wait for any updates to complete
    await page.waitForLoadState('networkidle');

    // Test login with old password
    await login(
      page,
      {
        email: user.email,
        password: user.password,
      },
      {
        expectCredentialsError: true,
      },
    );

    // Clear any error state before trying new credentials
    await page.waitForLoadState('networkidle');

    // Test login with new password
    await login(
      page,
      {
        email: user.email,
        password: newPassword,
      },
      {
        use2Fa: false, // Skip 2FA since confirmation of credentials is enough
      },
    );
  });

  test('should show error when password is empty', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    await page.getByTestId('profile-password-input').fill('');
    await page.getByTestId('profile-save-button').click();

    // Assert that the error message is shown
    await expect(page.getByText('Password must be at least 4 characters long')).toBeVisible();
  });

  test('should delete account', async ({page}) => {
    const user = await register(page);
    await login(page, {
      email: user.email,
      password: user.password,
    });

    await page.getByTestId('header-user-menu-button').click();
    await page.getByText('Profile').click();

    // Assert that we are redirected to the profile page
    await expect(page).toHaveURL(/\/profile/);

    await page.getByTestId('profile-delete-button').click();
    await page.getByText('Yes').click();

    // Assert that the account has been deleted
    await expect(page.getByText('Deleted profile successfully')).toBeVisible();

    // Wait for deletion to complete
    await page.waitForLoadState('networkidle');

    // Validate that the old email cannot be used to login
    await login(
      page,
      {
        email: user.email,
        password: user.password,
      },
      {
        expectCredentialsError: true,
      },
    );
  });
});
