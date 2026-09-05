// Ghana regions for checkout, plus a helper for looking up the
// admin-set delivery fee for a region.
//
// The fee itself lives in the `shipping_fees` table (one row per
// region, edited by the admin in /admin → Delivery Fees) — there's no
// hardcoded schedule here. place_order() reads it server-side via
// shipping_fee_for_region() (see supabase/schema.sql), so the fee
// actually charged can't be forged from the browser console; the
// checkout page fetches the same table just to show the fee/total
// before the order is placed.

export const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
] as const;

export type ShippingFeeMap = Record<string, number>;

export function getShippingFee(fees: ShippingFeeMap, region: string): number {
  return fees[region] ?? 0;
}
