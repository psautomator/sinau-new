"use client";

import { useEffect, useState } from "react";
import { completeLessonAction } from "@/app/actions/progress";
import { useScroll, useSpring, motion } from "framer-motion";

interface ScrollProgressTrackerProps {
    lessonId: string;
}

export default function ScrollProgressTracker({ lessonId }: ScrollProgressTrackerProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // We can use a simpler approach effectively with standard scroll listener if we want exact "bottom" triggers,
    // but framer-motion is nice for the bar. Let's use a standard listener for triggering.
    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        if (hasCompleted) return;

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Trigger when scrolled 90% or within 100px of bottom
            if (scrollTop + windowHeight >= docHeight - 100) {
                completeLesson();
            }
        };

        const completeLesson = async () => {
            if (hasCompleted) return;
            setHasCompleted(true); // Optimistic prevent double fire

            try {
                const res = await completeLessonAction(lessonId);
                // Optional: Show toast?
                if (res?.success) {
                    console.log("Lesson completed via scroll");
                }
            } catch (err) {
                console.error(err);
                // Allow retry if it failed? standard is just fail silently for scroll tracking
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lessonId, hasCompleted]);

    return (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-200/20 z-50 pointer-events-none">
            <motion.div
                className="h-full bg-primary origin-left"
                style={{ scaleX }}
            />
        </div>
    );
}
