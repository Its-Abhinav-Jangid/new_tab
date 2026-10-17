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

import useDelayedUnmount from "../hooks/useDelayedUnmount";

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

  const secondsAnim = useDelayedUnmount(showSeconds, 180);
  const ampmAnim = useDelayedUnmount(timeFormat === "12h", 180);
  const dateAnim = useDelayedUnmount(showDate, 200);

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
        {secondsAnim.shouldRender && (
          <span
            className={`clock-ss ${
              secondsAnim.isExiting ? "anim-fade-disappear" : "anim-fade-appear"
            }`}
          >
            {second}
          </span>
        )}
        {ampmAnim.shouldRender && (
          <span
            className={`clock-ampm ${
              ampmAnim.isExiting ? "anim-fade-disappear" : "anim-fade-appear"
            }`}
          >
            {ampm}
          </span>
        )}
      </div>
      {dateAnim.shouldRender && (
        <div className={`clock-date ${dateAnim.animClass}`}>
          {DAYS[now.getDay()]}, {MONTHS[now.getMonth()]} {now.getDate()}{" "}
          {now.getFullYear()}
        </div>
      )}
    </div>
  );
}
