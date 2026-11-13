import { Fragment } from "react";

const URL_PATTERN = /(https?:\/\/[^\s<>"')]+|www\.[^\s<>"')]+)/gi;

// Renders plain text but turns any pasted link into a real, clickable link.
export default function LinkifiedText({ text = "", className = "" }) {
  const parts = String(text || "").split(URL_PATTERN);

  return (
    <div className={`${className} [overflow-wrap:anywhere]`}>
      {parts.map((part, index) => {
        if (!/^(https?:\/\/|www\.)/i.test(part)) {
          return <Fragment key={index}>{part}</Fragment>;
        }
        const href = part.toLowerCase().startsWith("www.") ? `https://${part}` : part;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words font-semibold text-primary underline underline-offset-2"
          >
            {part}
          </a>
        );
      })}
    </div>
  );
}