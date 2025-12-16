import { getSession } from 'next-auth/react';

export default async function fetchToken() {
  const session = await getSession();
  return session?.user?.accessToken;
}
