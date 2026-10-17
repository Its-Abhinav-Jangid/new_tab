import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import "./Clock.css";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Clock() {
  const [settings] = useSettings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeFormat = settings?.timeFormat || "24h";
  const showSeconds = settings?.showSeconds ?? true;
  const showDate = settings?.showDate ?? true;

  let rawHours = now.getHours();
  let ampm = "";
  if (timeFormat === "12h") {
    ampm = rawHours >= 12 ? " PM" : " AM";
    rawHours = rawHours % 12 || 12;
  }

  const hour = String(rawHours).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  return (
    <div className="clock" title="Time is an illusion. Coffee doubly so.">
      <div className="clock-time">
        <span className="clock-hhmm">
          {hour}:{minute}
        </span>
        {showSeconds && <span className="clock-ss">{second}</span>}
        {timeFormat === "12h" && <span className="clock-ampm">{ampm}</span>}
      </div>
      {showDate && (
        <div className="clock-date">
          {DAYS[now.getDay()]}, {MONTHS[now.getMonth()]} {now.getDate()}{" "}
          {now.getFullYear()}
        </div>
      )}
    </div>
  );
}
