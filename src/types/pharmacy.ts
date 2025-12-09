export type OperatingHours = Record<
  string,
  {
    open: string | null;
    close: string | null;
  }
>;

export type Pharmacy = {
  id?: string;
  hpid: string;
  name: string;
  address: string;
  tel?: string;
  latitude?: number | null;
  longitude?: number | null;
  operating_hours?: OperatingHours | null;
  description_raw?: string | null;
  province?: string | null;
  city?: string | null;
  updated_at?: string | null;
};

