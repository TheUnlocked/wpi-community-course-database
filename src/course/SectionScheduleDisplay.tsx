import { Component, createMemo, For, PropsWithChildren, Show } from "solid-js";
import { Offering } from "../../server/courses";

import styles from './SectionScheduleDisplay.module.css';

const SectionScheduleDisplay: Component<{ section: Offering }> = props => {

    const startAndEndTimes = createMemo(() => props.section.meetingTime?.split(' - '));
    const middleChunks = createMemo(() => {
        if (!startAndEndTimes()) {
            return [];
        }

        const [start, end] = startAndEndTimes()!;
        const startHour = +start.split(':', 1)[0];
        const endHour = +end.split(':', 1)[0];

        const diff = endHour < startHour ? endHour + 12 - startHour : endHour - startHour;

        return [...new Array(diff)].map((_, i) => {
            const hour = +start.split(':', 1)[0] + i + 1;

            // There are no midnight classes so we only need to worry about going
            // from AM to PM, not PM to AM.
            if (hour === 12) {
                return `${hour}:${start.split(':')[1].slice(0, -2)}PM`;
            }
            else if (hour > 12) {
                return `${hour - 12}:${start.split(':')[1].slice(0, -2)}PM`;
            }
            else {
                return `${hour}:${start.split(':')[1]}`;
            }
        });
    });

    return <div className={styles.container}>
        <Show
            when={props.section.meetingDays.length > 0}
            fallback={<ion-text color="medium" className={styles.noClassTimes}>No planned class time</ion-text>}
        >
            <ion-grid>
                <ion-row>
                    <ion-col></ion-col>
                    <ion-col>M</ion-col>
                    <ion-col>T</ion-col>
                    <ion-col>W</ion-col>
                    <ion-col>R</ion-col>
                    <ion-col>F</ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>{startAndEndTimes()?.[0]}</ion-col>
                    <ion-col className={`${styles.timeTop} ${!props.section.meetingDays.includes('M') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeTop} ${!props.section.meetingDays.includes('T') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeTop} ${!props.section.meetingDays.includes('W') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeTop} ${!props.section.meetingDays.includes('R') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeTop} ${!props.section.meetingDays.includes('F') ? styles.hidden : ''}`}></ion-col>
                </ion-row>
                <For each={middleChunks()}>
                    {time => <ion-row>
                        <ion-col>{time}</ion-col>
                        <ion-col className={`${styles.timeMid} ${!props.section.meetingDays.includes('M') ? styles.hidden : ''}`}></ion-col>
                        <ion-col className={`${styles.timeMid} ${!props.section.meetingDays.includes('T') ? styles.hidden : ''}`}></ion-col>
                        <ion-col className={`${styles.timeMid} ${!props.section.meetingDays.includes('W') ? styles.hidden : ''}`}></ion-col>
                        <ion-col className={`${styles.timeMid} ${!props.section.meetingDays.includes('R') ? styles.hidden : ''}`}></ion-col>
                        <ion-col className={`${styles.timeMid} ${!props.section.meetingDays.includes('F') ? styles.hidden : ''}`}></ion-col>
                    </ion-row>}
                </For>
                <ion-row>
                    <ion-col>{startAndEndTimes()?.[1]}</ion-col>
                    <ion-col className={`${styles.timeEnd} ${!props.section.meetingDays.includes('M') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeEnd} ${!props.section.meetingDays.includes('T') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeEnd} ${!props.section.meetingDays.includes('W') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeEnd} ${!props.section.meetingDays.includes('R') ? styles.hidden : ''}`}></ion-col>
                    <ion-col className={`${styles.timeEnd} ${!props.section.meetingDays.includes('F') ? styles.hidden : ''}`}></ion-col>
                </ion-row>
            </ion-grid>
        </Show>
    </div>;
}

export default SectionScheduleDisplay;