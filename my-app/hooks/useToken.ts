import { usePathname } from 'next/navigation';

export function useToken(slice: number) {
    const pathName = usePathname();
    const tok = JSON.stringify(pathName);
    const mintToken = tok.slice(slice, tok.length - 1);
    return mintToken;
}