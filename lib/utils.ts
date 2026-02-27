// Utility functions for XENTRO

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: amount >= 1000000 ? 'compact' : 'standard',
        maximumFractionDigits: amount >= 1000000 ? 1 : 0,
    });
    return formatter.format(amount);
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export function hasValidPitchContent(v: string | null | undefined): boolean {
    if (!v) return false;
    const str = v.trim();
    if (str === '') return false;
    if (str === '<p></p>' || str === '<p><br></p>') return false;
    if (str.includes('<img') || str.includes('<iframe') || str.includes('<video')) return true;
    const stripped = str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim();
    return stripped.length > 0;
}

export function hasValidPitchItem(item: unknown): boolean {
    if (!item || typeof item !== 'object') return false;
    const obj = item as Record<string, unknown>;

    // Enforce that main fields cannot be empty if they are present on the object
    if ('name' in obj && !hasValidPitchContent(obj.name as string)) return false;
    if ('title' in obj && !hasValidPitchContent(obj.title as string)) return false;
    if ('description' in obj && !hasValidPitchContent(obj.description as string)) return false;
    if ('testimonial' in obj && !hasValidPitchContent(obj.testimonial as string)) return false;

    // Finally, verify it actually has at least one valid string field (fallback check)
    return Object.values(obj).some(val => typeof val === 'string' && hasValidPitchContent(val));
}
