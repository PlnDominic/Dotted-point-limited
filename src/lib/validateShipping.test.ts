import { describe, expect, it } from "vitest";
import { validateShipping, type ShippingDetails } from "./validateShipping";

const complete: ShippingDetails = {
  email: "kwame@example.com",
  fullName: "Kwame Mensah",
  phone: "0541234567",
  address: "12 Ring Road",
  city: "Accra",
  region: "Greater Accra",
  notes: "",
};

describe("validateShipping", () => {
  it("returns no errors when every required field is filled in", () => {
    expect(validateShipping(complete)).toEqual({});
  });

  it("notes is optional — omitting it alone doesn't fail validation", () => {
    expect(validateShipping({ ...complete, notes: "" })).toEqual({});
  });

  it.each([
    ["email", "Email is required"],
    ["fullName", "Full name is required"],
    ["phone", "Phone number is required"],
    ["address", "Delivery address is required"],
    ["city", "Town / city is required"],
    ["region", "Region is required"],
  ] as const)("flags a missing %s", (field, message) => {
    const errors = validateShipping({ ...complete, [field]: "" });
    expect(errors[field]).toBe(message);
    expect(Object.keys(errors)).toEqual([field]);
  });

  it("treats whitespace-only input as missing", () => {
    const errors = validateShipping({ ...complete, fullName: "   " });
    expect(errors.fullName).toBe("Full name is required");
  });

  it("reports every missing field at once, not just the first", () => {
    const errors = validateShipping({
      email: "",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      region: "",
      notes: "",
    });
    expect(Object.keys(errors).sort()).toEqual(
      ["address", "city", "email", "fullName", "phone", "region"].sort()
    );
  });
});
