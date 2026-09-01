export type ShippingDetails = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  notes: string;
};

export type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;

/**
 * Pulled out of the checkout page so it can be unit-tested without
 * rendering the component. Every field but `notes` is required.
 */
export function validateShipping(shipping: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};
  if (!shipping.email.trim()) errors.email = "Email is required";
  if (!shipping.fullName.trim()) errors.fullName = "Full name is required";
  if (!shipping.phone.trim()) errors.phone = "Phone number is required";
  if (!shipping.address.trim()) errors.address = "Delivery address is required";
  if (!shipping.city.trim()) errors.city = "Town / city is required";
  if (!shipping.region.trim()) errors.region = "Region is required";
  return errors;
}
