const formattedDate = function (date: string) {
  if (!date) return "No date";

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
  return formattedDate;
};

export default formattedDate;
