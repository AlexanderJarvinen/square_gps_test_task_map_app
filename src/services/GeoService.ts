import i18n from "@/i18n";

export class GeoService {
  private static BASE_URL = "https://geocode.maps.co";
  private static API_KEY = process.env.VUE_APP_GEOCODE_API_KEY || "";

  static async reverseGeocode(
    lat: number,
    lon: number,
    timeoutMs = 8000
  ): Promise<string | null> {
    const url = `${this.BASE_URL}/reverse?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&api_key=${encodeURIComponent(
      this.API_KEY
    )}`;

    const fetchPromise = fetch(url).then(async (res) => {
      if (!res.ok) {
        const msg = i18n.t("backend.geocoder.httpStatus", {
          status: res.status,
        });
        throw new Error(String(msg));
      }

      const data = await res.json();
      const name: string | undefined =
        data?.display_name ??
        (data?.address
          ? Object.values<string>(data.address).join(", ")
          : undefined);
      return name?.trim() || null;
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(
        () => reject(new Error(String(i18n.t("backend.geocoder.timeout")))),
        timeoutMs
      )
    );

    return Promise.race([fetchPromise, timeoutPromise]);
  }
}
