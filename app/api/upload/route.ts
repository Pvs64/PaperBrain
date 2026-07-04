import {NextResponse} from "next/server";
import {handleUpload, type HandleUploadBody} from "@vercel/blob/client";
import {auth} from "@clerk/nextjs/server";
import {MAX_FILE_SIZE} from "@/lib/constants";

const getCallbackUrl = (request: Request) => {
    const requestUrl = new URL(request.url);
    const callbackBaseUrl = process.env.VERCEL_BLOB_CALLBACK_URL || process.env.NEXT_PUBLIC_APP_URL;

    if (callbackBaseUrl) {
        return `${callbackBaseUrl}${requestUrl.pathname}`;
    }

    if (requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1') {
        return `${requestUrl.origin}${requestUrl.pathname}`;
    }

    return undefined;
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as HandleUploadBody;
        const callbackUrl = getCallbackUrl(request);

        const jsonResponse = await handleUpload({
            token: process.env.BLOB_READ_WRITE_TOKEN,
            body,
            request,
            onBeforeGenerateToken: async () => {
                const { userId } = await auth();

                if(!userId) {
                    throw new Error('Unauthorized: User not authenticated');
                }

                return {
                    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId }),
                    callbackUrl,
                }
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('File uploaded to blob:', blob.url);

                try {
                    const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
                    const userId = payload?.userId;

                    if (!userId) {
                        console.warn('Upload completed without a user id in the token payload');
                    }
                } catch (error) {
                    console.warn('Could not parse upload token payload', error);
                }
            }
        });

        return NextResponse.json(jsonResponse)
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred";
        const status = message.includes('Unauthorized') ? 401 : 500;
        console.error('Upload error', e);
        const clientMessage = status === 401 ? 'Unauthorized' : 'Upload failed. Please refresh and try again.';
        return NextResponse.json({ error: clientMessage }, { status });
    }
}