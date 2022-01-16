import { InfiniteScrollCustomEvent } from "@ionic/core";
import { min } from "lodash";
import { Component, createEffect, createResource, createSignal, For } from "solid-js";
import { Course } from "../../server/courses";
import fetchCourseListings from "../api/courselistings";
import AvailabilityBadge from "../common/AvailabilityBadge";
import SourceButton from "../common/SourceButton";
import { searchValue } from "../GlobalSearch";

const LOAD_INCREMENT = 50;

import styles from './index.module.css';

const CourseListings: Component = () => {

    const [courseData] = createResource(fetchCourseListings);

    const [scrolledTo, setScrolledTo] = createSignal(LOAD_INCREMENT);

    const scroller = <ion-infinite-scroll
        threshold="1200px"
        disabled={scrolledTo() > (courseData()?.length ?? 0)}
        on:ionInfinite={e => {
            setScrolledTo(x => x + LOAD_INCREMENT);
            e.target.complete();
        }}>
        <ion-infinite-scroll-content
            loading-spinner="bubbles"
            loading-text="Loading more data..." />
    </ion-infinite-scroll> as HTMLIonInfiniteScrollElement;

    const [filteredCourseData, setFilteredCourseData] = createSignal([] as Course[]);
    
    createEffect(() => {
        setFilteredCourseData(courseData()
            ?.map(x => {
                const searchString = [
                    ...x.termsAvailable.map(x => `term:${x}`),
                    `dept:${x.departmentSymbol}`,
                    ...x.aliases,
                ].join('\0').toLowerCase() + '\0' + [
                    x.departmentSymbol,
                    x.courseNumber,
                    x.title,
                    x.description,
                ].join('').toLowerCase();
                return {
                    ...x,
                    searchScore: min(searchValue().split(' ').map(query => {
                        const index = searchString.indexOf(query.toLowerCase());
                        if (index === -1) return -1;
                        return 100_000 - index;
                    })) ?? 100_000
                };
            })
            .filter(x => x.searchScore > 0)
            .sort((a, b) => b.searchScore - a.searchScore) ?? []);
        
        setScrolledTo(LOAD_INCREMENT);
    });

    return <>
        <SourceButton endpoint="/api/courses/all" />
        <ion-list className={styles.courseList}>
            <For each={filteredCourseData()?.slice(0, scrolledTo())}>
                {course => <ion-item button href={`/course/${course.id}`} className={styles.item}>
                    <div slot="start" className={styles.classBadgeHolder}>
                        <ion-badge color="tertiary">{course.departmentSymbol}</ion-badge>
                        <ion-badge color="tertiary">{course.courseNumber}</ion-badge>
                    </div>
                    <ion-label className={styles[course.availability]}>
                        {course.title}
                    </ion-label>
                    <AvailabilityBadge availability={course.availability} />
                </ion-item>}
            </For>
        </ion-list>
        {scroller}
    </>;
};

export default CourseListings;