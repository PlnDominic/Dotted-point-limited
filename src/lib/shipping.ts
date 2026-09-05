// Ghana regions + delivery fee schedule for checkout.
//
// Flat-rate by region: Greater Accra (where Dotted Point is based) is
// cheaper to deliver to than everywhere else. This mirrors the
// shipping_fee_for_region() SQL function in supabase/schema.sql — that
// function is the source of truth (it's what actually prices the order),
// this copy exists purely so the checkout page can show the fee/total
// before placing the order without a round trip. Keep the two in sync if
// the schedule ever changes.

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

const LOCAL_REGION_FEE = 30;
const OUT_OF_TOWN_FEE = 80;

export function getShippingFee(region: string): number {
  return region === "Greater Accra" ? LOCAL_REGION_FEE : OUT_OF_TOWN_FEE;
}
