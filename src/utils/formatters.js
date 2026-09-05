export const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

export function iconFor(category) {
  if (category === "Credit Card" || category === "Buy Now Pay Later")
    return "▣";
  if (category === "Subscription") return "⌁";
  if (category === "Other") return "✦";
  return "⌂";
}
