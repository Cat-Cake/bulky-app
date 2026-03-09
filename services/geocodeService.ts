export async function reverseGeocode(lat: number, lon: number) {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lon}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Reverse geocoding failed");

    const json = await res.json();
    const f = json?.features?.[0];
    const label = f?.properties?.label ?? "";

    return { label };
}