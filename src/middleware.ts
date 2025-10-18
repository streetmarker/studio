import { NextRequest, NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { nextHandler } from '@genkit-ai/next';
import {getFirebaseAdmin} from '@/firebase/server';

const handler = nextHandler({
  // This is how you can add authentication to your flows.
  // The user object will be available in the `auth` property of the flow input.
  auth: async (req: NextRequest) => {
    const {auth} = getFirebaseAdmin();
    try {
      const authorization = req.headers.get('Authorization');
      if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        return {
          id: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
        };
      }
    } catch (e: any) {
      console.error(e);
      // You can also return an error here.
    }
    return null;
  },
  // This is the Genkit instance to use.
  genkit,
});

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

  // If there's an ID token, forward it to the Genkit handler
  if (idToken) {
    return new Promise<NextResponse>((resolve) => {
      const res = new NextResponse();
      // This is a workaround to allow the Next.js handler to work in a Next.js environment.
      Object.defineProperty(res, 'send', {
        value: (body: any) => {
          const newRes = new NextResponse(body);
          newRes.headers.forEach((v, k) => res.headers.set(k, v));
          resolve(newRes);
        },
      });
      // This is a bit of a hack to get the response back from the handler.
      (res as any).status = (code: number) => {
        res.headers.set('status', code.toString());
        return res;
      };
      (res as any).json = (body: any) => {
        res.headers.set('Content-Type', 'application/json');
        resolve(new NextResponse(JSON.stringify(body)));
        return res;
      };
      handler(req as any, res as any);
    });
  }

  // Fallback for requests without Authorization header, though this might not be your intended use case.
  return NextResponse.next();
}
