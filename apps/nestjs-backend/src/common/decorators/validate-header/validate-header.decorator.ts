import {createParamDecorator, ExecutionContext, NotAcceptableException} from '@nestjs/common';
import {Request} from 'express';
import {HeaderDecoratorParam} from './types/header-decorator.param.type';

/**
 * A NestJS parameter decorator that validates HTTP request headers with flexible validation options.
 *
 * This decorator extracts and validates HTTP headers from incoming requests, supporting various
 * validation strategies including exact matching, pattern matching, enum validation, and array validation.
 * It throws a `NotAcceptableException` if validation fails.
 *
 * @param param - Either a header name string or a configuration object with validation options
 * @returns The validated header value as string or string array
 * @throws {NotAcceptableException} When header is missing or validation fails
 *
 * @example
 * // Basic header extraction without validation
 * @Get('/example')
 * getExample(@ValidateHeader('Authorization') authHeader: string) {
 *   return { auth: authHeader };
 * }
 *
 * @example
 * // Header validation with expected string value
 * @Post('/api/data')
 * postData(
 *   @ValidateHeader({
 *     headerName: 'Content-Type',
 *     options: { expectedValue: 'application/json' }
 *   }) contentType: string
 * ) {
 *   return { received: contentType };
 * }
 *
 * @example
 * // Header validation with multiple accepted values
 * @Get('/localized')
 * getLocalized(
 *   @ValidateHeader({
 *     headerName: 'Accept-Language',
 *     options: { expectedValue: ['en', 'de', 'fr'] }
 *   }) language: string
 * ) {
 *   return { language };
 * }
 *
 * @example
 * // Header validation with enum
 * @Post('/users')
 * createUser(
 *   @Body() userData: CreateUserDto,
 *   @ValidateHeader({
 *     headerName: 'Accept-Language',
 *     options: { expectedValue: AcceptedLanguages }
 *   }) language: AcceptedLanguages
 * ) {
 *   return this.usersService.create(userData, language);
 * }
 *
 * @example
 * // Header validation with RegExp pattern
 * @Get('/secure')
 * getSecure(
 *   @ValidateHeader({
 *     headerName: 'Authorization',
 *     options: {
 *       expectedValue: /^Bearer .+$/,
 *       missingMessage: 'Authorization header is required',
 *       invalidValueMessage: 'Authorization must be a Bearer token'
 *     }
 *   }) authHeader: string
 * ) {
 *   return { token: authHeader };
 * }
 *
 * @example
 * // Case-sensitive header validation
 * @Post('/strict')
 * postStrict(
 *   @ValidateHeader({
 *     headerName: 'X-Custom-Header',
 *     options: {
 *       expectedValue: 'ExactValue',
 *       caseSensitive: true
 *     }
 *   }) customHeader: string
 * ) {
 *   return { custom: customHeader };
 * }
 *
 * @example
 * // Allow empty header values
 * @Get('/optional')
 * getOptional(
 *   @ValidateHeader({
 *     headerName: 'X-Optional-Header',
 *     options: { allowEmpty: true }
 *   }) optionalHeader: string
 * ) {
 *   return { optional: optionalHeader || 'default' };
 * }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ValidateHeader = createParamDecorator(
  (param: HeaderDecoratorParam, ctx: ExecutionContext): string | string[] => {
    const request: Request = ctx.switchToHttp().getRequest();

    // Handle both string and object parameters
    const headerName = typeof param === 'string' ? param : param.headerName;
    const options = typeof param === 'string' ? {} : (param.options ?? {});

    const {expectedValue, caseSensitive = false, missingMessage, invalidValueMessage, allowEmpty = false} = options;

    const headerValue = request.headers[headerName.toLowerCase()];

    // Check if header exists
    if (headerValue === undefined || headerValue === null || (!allowEmpty && headerValue === '')) {
      const message = missingMessage ?? `Missing required header: ${headerName}`;
      throw new NotAcceptableException(message);
    }

    // If no expected value specified, return the header value
    if (expectedValue === undefined) {
      return headerValue;
    }

    // Validate header value
    const isValid = validateHeaderValue(headerValue, expectedValue, caseSensitive);

    if (!isValid) {
      const message =
        invalidValueMessage ??
        `Invalid value for header '${headerName}'. Expected: ${formatExpectedValue(expectedValue)}`;
      throw new NotAcceptableException(message);
    }

    return headerValue;
  },
);

/**
 * Validates header value against expected value(s) using various validation strategies.
 *
 * @param headerValue - The actual header value(s) from the request
 * @param expectedValue - Expected value(s) in various formats (string, array, RegExp, enum)
 * @param caseSensitive - Whether comparison should be case-sensitive
 * @returns True if validation passes, false otherwise
 *
 * @internal
 */
function validateHeaderValue(
  headerValue: string | string[],
  expectedValue: string | string[] | RegExp | Record<string, string | number>,
  caseSensitive: boolean,
): boolean {
  // Convert header value to array for consistent processing
  const headerValues = Array.isArray(headerValue) ? headerValue : [headerValue];

  // RegExp validation
  if (expectedValue instanceof RegExp) {
    return headerValues.some((value) => expectedValue.test(value));
  }

  // Enum validation (check if it's an object with string/number values)
  if (typeof expectedValue === 'object' && !Array.isArray(expectedValue) && expectedValue !== null) {
    const enumValues = Object.values(expectedValue).map(String);
    return headerValues.some((headerVal) =>
      enumValues.some((enumVal) =>
        caseSensitive ? headerVal === enumVal : headerVal.toLowerCase() === enumVal.toLowerCase(),
      ),
    );
  }

  // String or array validation
  const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];

  return headerValues.some((headerVal) =>
    expectedValues.some((expectedVal) =>
      caseSensitive ? headerVal === expectedVal : headerVal.toLowerCase() === expectedVal.toLowerCase(),
    ),
  );
}

/**
 * Formats expected value for error messages in a human-readable format.
 *
 * @param expectedValue - Expected value(s) in various formats
 * @returns Formatted string representation for error messages
 *
 * @internal
 */
function formatExpectedValue(expectedValue: string | string[] | RegExp | Record<string, string | number>): string {
  if (expectedValue instanceof RegExp) {
    return expectedValue.toString();
  }

  if (Array.isArray(expectedValue)) {
    return expectedValue.join(' | ');
  }

  // Handle enum objects
  if (typeof expectedValue === 'object' && expectedValue !== null) {
    return Object.values(expectedValue).join(' | ');
  }

  return String(expectedValue);
}
