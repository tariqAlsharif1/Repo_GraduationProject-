export const formatJD = (value) => {
  const num = Number(value ?? 0);
  return `${num.toFixed(2)} JD`;
};

export const formatShortDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
};

export const formatRelativeDay = (isoDate) => {
  if (!isoDate) return "";
  const today = new Date();
  const date = new Date(isoDate);
  const diffDays = Math.round((today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatShortDate(isoDate);
};

export const currentMonthLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
