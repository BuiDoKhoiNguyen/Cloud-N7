import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localeVi from "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.locale(localeVi);
dayjs.locale("vi");

export const formatDate = (date, type = "full") => {
  const d = dayjs(date);

  switch (type) {
    case "fromNow":
      return d.fromNow();
    case "full":
      return d.format("DD/MM/YYYY HH:mm:ss");
    case "date":
      return d.format("DD/MM/YYYY");
    case "time":
      return d.format("HH:mm:ss");
    case "timeShort":
      return d.format("HH:mm");
    case "relativeDay":
      if (d.isToday()) return "Hôm nay";
      if (d.isYesterday()) return "Hôm qua";
      if (dayjs().diff(d, "day") < 7)
        return `${dayjs().diff(d, "day")} ngày trước`;
      if (dayjs().diff(d, "week") < 2) return "1 tuần trước";
      return d.format("DD/MM/YYYY");
    default:
      return d.format("DD/MM/YYYY HH:mm:ss");
  }
};
