"use client";

import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { Event } from "@/types";

interface AnimatedEventGridProps {
  events: Event[];
  className?: string;
}

export default function AnimatedEventGrid({ events, className }: AnimatedEventGridProps) {
  return (
    <div className={className}>
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
        >
          <EventCard event={event} />
        </motion.div>
      ))}
    </div>
  );
}
