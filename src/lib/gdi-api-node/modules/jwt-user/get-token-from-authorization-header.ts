/** Given (Koa) headers, extract bearer token */
export const getTokenFromAuthorizationHeader = (
  headers: Record<string, string | string[] | undefined>
): string | null =>
  /^Bearer\s(.+)$/gim.exec(headers?.authorization as string)?.[1]?.trim() ||
  null
