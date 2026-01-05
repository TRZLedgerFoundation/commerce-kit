import {
    createStyledQRCode,
    encodeURL,
    TransferRequestURLFields,
    createTPLToken,
    createRecipient,
} from '@trezoa-commerce/trezoa-pay';
import { toMinorUnits } from '../utils/validation';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type DotStyle = 'dots' | 'rounded' | 'square';
export type CornerStyle = 'square' | 'rounded' | 'extra-rounded' | 'full-rounded' | 'maximum-rounded';

export interface TrezoaPayRequestOptions {
    size?: number;
    background?: string;
    color?: string;
    // Advanced QR customization options
    margin?: number;
    errorCorrectionLevel?: ErrorCorrectionLevel;
    logo?: string;
    logoSize?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    dotStyle?: DotStyle;
    cornerStyle?: CornerStyle;
}

export async function createTrezoaPayRequest(request: TransferRequestURLFields, options: TrezoaPayRequestOptions) {
    const url = encodeURL(request);

    const qr = await createStyledQRCode(url.toString(), {
        width: options.size ?? 256,
        margin: options.margin,
        color: {
            dark: options.color ?? 'black',
            light: options.background ?? 'white',
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
        logo: options.logo,
        logoSize: options.logoSize,
        logoBackgroundColor: options.logoBackgroundColor,
        logoMargin: options.logoMargin,
        dotStyle: options.dotStyle,
        cornerStyle: options.cornerStyle,
    });

    return {
        url,
        qr,
    };
}

// Helper function to create a payment request with QR code from string inputs
export async function createQRPaymentRequest(
    recipientAddress: string,
    amount: number,
    tokenAddress?: string,
    options: TrezoaPayRequestOptions & {
        label?: string;
        message?: string;
        memo?: string;
    } = {},
) {
    try {
        const request: TransferRequestURLFields = {
            recipient: createRecipient(recipientAddress),
            amount: toMinorUnits(amount, 9), // Default to 9 decimals (SOL standard)
        };

        // Only add TPL token if provided and not SOL
        if (tokenAddress && tokenAddress !== 'TRZ') {
            request.tplToken = createTPLToken(tokenAddress);
        }

        if (options.label) request.label = options.label;
        if (options.message) request.message = options.message;
        if (options.memo) request.memo = options.memo;

        return await createTrezoaPayRequest(request, {
            size: options.size || 256,
            background: options.background || 'white',
            color: options.color || 'black',
            margin: options.margin,
            errorCorrectionLevel: options.errorCorrectionLevel,
            logo: options.logo,
            logoSize: options.logoSize,
            logoBackgroundColor: options.logoBackgroundColor,
            logoMargin: options.logoMargin,
            dotStyle: options.dotStyle,
            cornerStyle: options.cornerStyle,
        });
    } catch (error) {
        console.error('Error creating payment request:', error);
        throw error;
    }
}
