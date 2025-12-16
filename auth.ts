import { jwtDecode } from "jwt-decode";
import NextAuth, { CredentialsSignin, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import AWS from "aws-sdk";

class UserNotConfirmedError extends CredentialsSignin {
  code = "UserNotConfirmedException";
  constructor(message?: string) {
    super(message);
  }
}
class NotAuthorizedException extends CredentialsSignin {
  code = "NotAuthorizedException";
  constructor(message?: string) {
    super(message);
  }
}
class UserNotFoundException extends CredentialsSignin {
  code = "UserNotFoundException";
  constructor(message?: string) {
    super(message);
  }
}
// Custom error class for login request errors
class LoginRequestError extends CredentialsSignin {
  code = "LoginRequestError";
  message: string;
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

const ddb = new AWS.DynamoDB({
  region: process.env.C_AWS_REGION,
  credentials: {
    accessKeyId: process.env.C_AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.C_AWS_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.DDB_ENDPOINT || undefined, // optional for local/dev
});

const USER_TABLE = process.env.DDB_USER_TABLE || "User";

// Simple in-memory cache for user data (5 minute TTL)
const userCache = new Map<
  string,
  { data: any; expires: number }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getDbUser(sub: string) {
  if (!sub) return null;
  
  // Check cache first
  const cached = userCache.get(sub);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const out = await ddb
    .getItem({
      TableName: USER_TABLE,
      Key: { sub: { S: String(sub) } },
      ConsistentRead: true,
    })
    .promise();

  if (!out.Item) return null;
  const item = AWS.DynamoDB.Converter.unmarshall(out.Item) as {
    sub: string;
    email?: string;
    name?: string;
    username?: string;
    avatar?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    gender?: string;
    isManager?: boolean;
  };
  
  // Cache the result
  userCache.set(sub, {
    data: item,
    expires: Date.now() + CACHE_TTL,
  });
  
  return item;
}

async function refreshAccessToken(token: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.refreshToken }),
    }
  );
  const response = await res.json();
  const { data: user } = response;
  if (user) {
    return {
      ...token,
      accessToken: user.AuthenticationResult.AccessToken,
      exp: user.AuthenticationResult.ExpiresIn,
    };
  }
  return user || token;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          }
        );
        const response = await res.json();

        // If there's an error, throw appropriate error
        if (response.status === 0 || response.errorCode) {
          if (response.errorCode === "UserNotConfirmedException")
            throw new UserNotConfirmedError();
          if (response.errorCode === "NotAuthorizedException")
            throw new NotAuthorizedException();
          if (response.errorCode === "UserNotFoundException")
            throw new UserNotFoundException();
          
          // For other errors (like LoginAfterNoonNotAllowed), use custom error class
          // This allows us to pass the message through
          const errorMessage = response.msg || "Authentication failed";
          throw new LoginRequestError(errorMessage);
        }

        const { data } = response;
        return data || null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async authorized({ auth }) {
      return !!auth;
    },

    async jwt({ token, user }: { token: any; user: any }) {
      try {
        if (user) {
          // Fetch user data from DB on login and store in token
          const claims: any = user.AuthenticationResult?.AccessToken
            ? jwtDecode(user.AuthenticationResult.AccessToken)
            : null;
          const sub = claims?.sub as string | undefined;
          let dbUser = null;
          if (sub) {
            dbUser = await getDbUser(sub);
          }
          
          return {
            ...token,
            accessToken: user.AuthenticationResult.AccessToken,
            refreshToken: user.AuthenticationResult.RefreshToken,
            exp: user.AuthenticationResult.ExpiresIn,
            dbUser: dbUser || undefined,
          };
        }

        const claims: any = token?.accessToken
          ? jwtDecode(token.accessToken)
          : null;
        if (!claims?.exp) return null;
        if (Date.now() < claims.exp * 1000) return token;

        const refreshed = await refreshAccessToken(token);
        // Preserve dbUser when refreshing token
        return {
          ...refreshed,
          dbUser: token.dbUser,
        };
      } catch (e) {
        console.log("jwt err", e);
        return token;
      }
    },

    async session({ session, token }: { session: any; token: any }) {
      try {
        const claims = token?.accessToken ? jwtDecode(token.accessToken) : null;
        const sub = claims?.sub as string | undefined;

        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;

        // Store user data in token to avoid repeated DB calls
        if (sub) {
          // Check if we already have user data in token (from jwt callback)
          if (token.dbUser) {
            session.user.sub = token.dbUser.sub;
            session.user.name = token.dbUser.name ?? session.user.name ?? "";
            session.user.email = token.dbUser.email ?? session.user.email ?? "";
            session.user.username = token.dbUser.username ?? "";
            session.user.avatar = token.dbUser.avatar ?? "";
            session.user.role = token.dbUser.role ?? "";
            session.user.isManager = token.dbUser.isManager ?? false;
          } else {
            // Fallback: fetch from DB (will use cache)
            const dbUser = await getDbUser(sub);
            if (dbUser) {
              session.user.sub = dbUser.sub;
              session.user.name = dbUser.name ?? session.user.name ?? "";
              session.user.email = dbUser.email ?? session.user.email ?? "";
              session.user.username = dbUser.username ?? "";
              session.user.avatar = dbUser.avatar ?? "";
              session.user.role = dbUser.role ?? "";
              session.user.isManager = dbUser.isManager ?? false;
              // Store in token for next time
              token.dbUser = dbUser;
            } else {
              session.user.sub = sub;
              session.user.email =
                (claims as any)?.email ?? session.user.email ?? "";
              session.user.name =
                (claims as any)?.name ?? session.user.name ?? "";
              session.user.username = session.user.username ?? "";
              session.user.avatar = session.user.avatar ?? "";
              session.user.role = "";
              session.user.isManager = false;
            }
          }
        }

        return session;
      } catch (error) {
        console.log("session err", error);
        return session;
      }
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      sub: string;
      username: string;
      avatar: string;
      role?: string;
      isManager?: boolean;
      stripeCustomerId: string;
      subscription: string;
      subscriptionId: string;
      accessToken: string;
      refreshToken: string;
    } & DefaultSession["user"];
  }
}
