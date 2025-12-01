/**
 * Utility for copying text to clipboard with fallback
 * Handles cases where Clipboard API is blocked by permissions policy
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, using fallback:', error);
      // Fall through to fallback method
    }
  }

  // Fallback method using textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make it invisible but focusable
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (!successful) {
      throw new Error('execCommand failed');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}
