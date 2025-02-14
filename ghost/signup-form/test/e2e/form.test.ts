import {expect} from '@playwright/test';
import {initialize} from '../utils/e2e';
import {test} from '@playwright/test';

test.describe('Form', async () => {
    test.describe('Display options', () => {
        test('Displays the title', async ({page}) => {
            const {frame} = await initialize({page, title: 'Sign up to get the latest news and updates.'});

            // Check the Frame
            const h1 = frame.getByRole('heading');
            expect(await h1.innerText()).toBe('Sign up to get the latest news and updates.');
        });

        test('Displays the description', async ({page}) => {
            const {frame} = await initialize({page, title: 'Title', description: 'Sign up to get the latest news and updates.'});

            // Check the Frame
            const p = frame.getByRole('paragraph');
            expect(await p.innerText()).toBe('Sign up to get the latest news and updates.');
        });

        test('Uses the accent color', async ({page}) => {
            // Need rgb notation here, because getComputedStyle returns rgb notation
            const color = 'rgb(255, 123, 0)';
            const {frame} = await initialize({page, color});
            const submitButton = frame.getByRole('button');

            // Check calculated background color of the button
            const backgroundColor = await submitButton.evaluate((el) => {
                return window.getComputedStyle(el).backgroundColor;
            });
            expect(backgroundColor).toBe(color);
        });

        test('Has a minimal style when title is missing', async ({page}) => {
            let {frame} = await initialize({page});

            // Check no title or description present
            await expect(frame.getByRole('heading')).toHaveCount(0);
            await expect(frame.getByRole('paragraph')).toHaveCount(0);

            frame = (await initialize({page, description: 'Ignored'})).frame;

            // Check no title or description present
            await expect(frame.getByRole('heading')).toHaveCount(0);
            await expect(frame.getByRole('paragraph')).toHaveCount(0);
        });
    });

    test.describe('Submitting', () => {
        test('Can submit the form', async ({page}) => {
            const {frame, lastApiRequest} = await initialize({page, title: 'Sign up'});

            // Fill out the form
            const emailInput = frame.getByTestId('input');
            await emailInput.fill('jamie@example.com');

            // Click the submit button
            const submitButton = frame.getByTestId('button');
            await submitButton.click();

            // Check input and button are gone
            await expect(frame.getByTestId('input')).toHaveCount(0);
            await expect(frame.getByTestId('button')).toHaveCount(0);

            // Showing the success page
            await expect(frame.getByTestId('success-page')).toHaveCount(1);

            // Check email address text is visible on the page
            await expect(frame.getByText('jamie@example.com')).toBeVisible();

            // Check the request body
            expect(lastApiRequest.body).not.toBeNull();
            expect(lastApiRequest.body).toHaveProperty('labels', []);
            expect(lastApiRequest.body).toHaveProperty('email', 'jamie@example.com');
        });

        test('Send a label when submitting the form', async ({page}) => {
            const {frame, lastApiRequest} = await initialize({page, title: 'Sign up', labels: 'Hello world'});

            // Fill out the form
            const emailInput = frame.getByTestId('input');
            await emailInput.fill('jamie@example.com');

            // Click the submit button
            const submitButton = frame.getByTestId('button');
            await submitButton.click();

            // Showing the success page
            await expect(frame.getByTestId('success-page')).toHaveCount(1);

            // Check the request body
            expect(lastApiRequest.body).not.toBeNull();
            expect(lastApiRequest.body).toHaveProperty('labels', ['Hello world']);
            expect(lastApiRequest.body).toHaveProperty('email', 'jamie@example.com');
        });

        test('Send multiple labels when submitting the form', async ({page}) => {
            const {frame, lastApiRequest} = await initialize({page, title: 'Sign up', labels: 'Hello world,and another one'});

            // Fill out the form
            const emailInput = frame.getByTestId('input');
            await emailInput.fill('hey@example.com');

            // Click the submit button
            const submitButton = frame.getByTestId('button');
            await submitButton.click();

            // Showing the success page
            await expect(frame.getByTestId('success-page')).toHaveCount(1);

            // Check the request body
            expect(lastApiRequest.body).not.toBeNull();
            expect(lastApiRequest.body).toHaveProperty('labels', ['Hello world', 'and another one']);
            expect(lastApiRequest.body).toHaveProperty('email', 'hey@example.com');
        });

        test('Cannot submit the form with invalid email address', async ({page}) => {
            const {frame, lastApiRequest} = await initialize({page, title: 'Sign up'});

            // Fill out the form
            const emailInput = frame.getByTestId('input');
            await emailInput.fill('invalid');

            // Click the submit button
            const submitButton = frame.getByTestId('button');
            await submitButton.click();

            // Check input and button are not gone
            await expect(frame.getByTestId('input')).toHaveCount(1);
            await expect(frame.getByTestId('button')).toHaveCount(1);

            // Not showing the success page
            await expect(frame.getByTestId('success-page')).toHaveCount(0);

            // Check error message is visible on the page
            const errorMessage = frame.getByTestId('error-message');
            await expect(errorMessage).toHaveCount(1);
            expect(await errorMessage.innerText()).toBe('Please enter a valid email address');

            expect(lastApiRequest.body).toBeNull();

            // Try again
            await emailInput.fill('valid@example.com');
            await submitButton.click();

            // Check input and button are gone
            await expect(frame.getByTestId('input')).toHaveCount(0);
            await expect(frame.getByTestId('button')).toHaveCount(0);

            // Showing the success page
            await expect(frame.getByTestId('success-page')).toHaveCount(1);

            // Check email address text is visible on the page
            await expect(frame.getByText('valid@example.com')).toBeVisible();
        });

        test('Shows error message on network issues', async ({page}) => {
            const {frame} = await initialize({page, title: 'Sign up', site: '127.0.0.1:9999'});

            // Fill out the form
            const emailInput = frame.getByTestId('input');
            await emailInput.fill('valid@example.com');

            // Click the submit button
            const submitButton = frame.getByTestId('button');
            await submitButton.click();

            // Check input and button are not gone
            await expect(frame.getByTestId('input')).toHaveCount(1);
            await expect(frame.getByTestId('button')).toHaveCount(1);

            // Not showing the success page
            await expect(frame.getByTestId('success-page')).toHaveCount(0);

            // Check error message is visible on the page
            const errorMessage = frame.getByTestId('error-message');
            await expect(errorMessage).toHaveCount(1);
            expect(await errorMessage.innerText()).toBe('Something went wrong, please try again.');
        });
    });
});

