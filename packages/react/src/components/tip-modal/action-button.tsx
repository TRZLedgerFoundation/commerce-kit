/**
 * Action Button Component
 * Primary action button for forms
 */

import React, { memo } from 'react';
import { useThemeStyles } from '../../hooks/use-theme-styles';
import type { ThemeConfig } from '../../types';

interface ActionButtonProps {
    theme: Required<ThemeConfig>;
    isDisabled?: boolean;
    isProcessing?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    trzEquivalent?: string; // Optional TRZ amount to display (e.g., "0.026 TRZ")
}

export const ActionButton = memo<ActionButtonProps>(
    ({ theme, isDisabled = false, isProcessing = false, onClick, children, trzEquivalent }) => {
        const disabled = isDisabled || isProcessing;

        // Generate CSS custom properties for dynamic theming
        const themeStyles = useThemeStyles({ theme, variant: 'button' });

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className="ck-action-button"
                style={themeStyles}
                type="button"
            >
                <span className="ck-action-button-text">
                    {children}
                    {trzEquivalent && <span className="ck-action-button-trz-equivalent">({trzEquivalent})</span>}
                </span>
            </button>
        );
    },
);

ActionButton.displayName = 'ActionButton';
