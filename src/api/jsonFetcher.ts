export default async function jsonFetcher(endpoint: string): Promise<unknown> {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data;
}