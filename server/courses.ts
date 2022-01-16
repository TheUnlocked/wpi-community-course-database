import express, { Router } from "express";
import { readFile, writeFile } from "fs/promises";
import { groupBy, isEqual, omit } from "lodash";
import fetch from 'node-fetch';
import sanitize from "sanitize-html";

interface CourseListing {
    /** @example 2021-08-25 */
    Course_Section_Start_Date: string;
    /** @example M-T-R-F | 9:00 AM - 9:50 AM */
    Meeting_Patterns: string;
    /** @example AB 1531 - Elementary Arabic I */
    Course_Title: string;
    /** @example Salisbury Labs 406 */
    Locations: string;
    /** @example Lecture */
    Instructional_Format: string;
    /** @example 0/9 */
    Waitlist_Waitlist_Capacity: string;
    /** @example Cat. IAn intensive course to introduce the Arabic language to students with no background in Arabic. Oral language acquisition will stress structures and vocabulary required for basic communicative tasks. Emphasis will be on grammar, vocabulary, and writing system. Cultural aspects of Arabic-speaking countries introduced through course material.This course is closed to native speakers of Arabic and heritage speakers except with written permission from the instructor. */
    Course_Description: string;
    /** @example Arabic */
    Subject: string;
    /** @example In-Person */
    Delivery_Mode: string;
    /** @example Undergraduate */
    Academic_Level: string;
    /** @example Open */
    Section_Status: string;
    /** @example 3 */
    Credits: string;
    /** @example Salisbury Labs 406 | M-T-R-F | 9:00 AM - 9:50 AM */
    Section_Details: string;
    /** @example Mohammed El Hamzaoui */
    Instructors: string;
    /** @example 2021 Fall A Term */
    Offering_Period: string;
    /** @example A Term */
    Starting_Academic_Period_Type: string;
    /** @example Degree Attribute :: Humanities and Arts; Offering Pattern :: Category I */
    Course_Tags: string;
    /** @example AB 1531-A01 - Elementary Arabic I */
    Course_Section: string;
    /** @example 17/18 */
    Enrolled_Capacity: string;
    /** @example 2021-10-13 */
    Course_Section_End_Date: string;
    /** @example M-T-R-F */
    Meeting_Day_Patterns: string;
    /** @example Humanities and Arts Department */
    Course_Section_Owner: string;
}

export type TermSymbol = 'A' | 'B' | 'C' | 'D' | 'S' | 'F' | 'LS';
export type DayOfTheWeek = 'M' | 'T' | 'W' | 'R' | 'F';

export type CourseAvailability = 'open' | 'waitlist' | 'filled';

export interface Course {
    id: number;
    departmentSymbol: string;
    courseNumber: string;
    title: string;
    aliases: string[];
    description: string;
    termsAvailable: TermSymbol[];
    availability: CourseAvailability;
}

export interface DetailedCourse extends Course {
    offerings: Offering[];
}

export interface Offering {
    term: TermSymbol;
    section: string;
    instructor: string;
    meetingDays: DayOfTheWeek;
    meetingTime: string | null;
    capacity: number;
    enrolled: number;
    waitlistCapacity: number;
    waitlistOccupied: number;
    availability: CourseAvailability;
}

const coursesRoute = Router();

const COURSE_INFO_PATH = 'saved_data/course_info.json';

async function fetchCourses() {
    if (coursesCache) return coursesCache;

    try {
        const dataRaw = await readFile(COURSE_INFO_PATH, { encoding: 'utf-8' });
        coursesCache = Object.fromEntries(JSON.parse(dataRaw));
        return coursesCache;
    }
    catch (e) {}

    const res = await fetch('https://courselistings.wpi.edu/assets/prod-data.json');
    const data = (await (res.json()) as any).Report_Entry as CourseListing[];

    const partitionedCourses = groupBy(data, x => x.Course_Title);

    const courseEntries = Object.values(partitionedCourses).map<[number, DetailedCourse]>((listings, i) => {
        
        const offerings = listings.map<Offering>(x => {
            const capacity = +x.Enrolled_Capacity.split('/')[1];
            const enrolled = +x.Enrolled_Capacity.split('/', 1)[0];
            const waitlistCapacity = +x.Waitlist_Waitlist_Capacity.split('/')[1];
            const waitlistOccupied = +x.Waitlist_Waitlist_Capacity.split('/', 1)[0];

            return {
                term: (x.Course_Section.match(/^.*?-([ABCDSF]|LS)/)?.[1] ?? '?') as any,
                section: x.Course_Section.match(/^.*?-(.*?) /)?.[1] ?? '???',
                instructor: x.Instructors,
                meetingDays: x.Meeting_Day_Patterns?.split('-') as any ?? [],
                meetingTime: x.Meeting_Patterns?.split(' | ')[1] ?? null,
                capacity,
                enrolled,
                waitlistCapacity,
                waitlistOccupied,
                availability
                    : waitlistOccupied === 0 && enrolled < capacity
                    ? 'open'
                    : waitlistOccupied < waitlistCapacity
                    ? 'waitlist'
                    : 'filled'
            };
        });

        return [i, {
            id: i,
            departmentSymbol: listings[0].Course_Title.match(/^(.*?) /)?.[1] ?? 'NA',
            courseNumber: listings[0].Course_Title.match(/^.*? (.*?) /)?.[1] ?? '????',
            title: listings[0].Course_Title.match(/ - (.*)$/)?.[1] ?? 'Unknown Course',
            aliases: [],
            description: listings[0].Course_Description,
            termsAvailable: [...new Set(listings.map(x => x.Course_Section.match(/^.*?-([ABCDSF]|LS)/)?.[1]))] as any,
            offerings,
            availability
                : offerings.some(x => x.waitlistOccupied === 0 && x.enrolled < x.capacity)
                ? 'open'
                : offerings.some(x => x.waitlistOccupied < x.waitlistCapacity)
                ? 'waitlist'
                : 'filled'
        }];
    });

    coursesCache = Object.fromEntries(courseEntries);
    writeFile(COURSE_INFO_PATH, JSON.stringify(coursesCache), { encoding: 'utf-8' });
    return coursesCache;
}

let coursesCache: { [id: number]: DetailedCourse }; 

coursesRoute.get('/all', async (req, res) => {
    res.json(Object.values(await fetchCourses()).map(x => omit(x, ['offerings'])));
});

coursesRoute.get('/:id', async (req, res) => {
    res.json((await fetchCourses())[+req.params.id]);
});

coursesRoute.patch('/:id', express.json(), async (req, res) => {
    await fetchCourses();

    const delta = req.body as Partial<Course>;
    const id = +req.params.id;

    if (typeof delta !== 'object' || !(id in coursesCache)) {
        res.status(400).send('Bad Request');
    }

    const course = { ...coursesCache[id] };

    let changed = false;
    if (delta.aliases) {
        if (delta.aliases instanceof Array && delta.aliases.every(x => typeof x === 'string')) {
            if (!isEqual(delta.aliases, course.aliases)) {
                course.aliases = delta.aliases;
                changed = true;
            }
        }
        else {
            res.status(400).send('Bad Request');
        }
    }
    if (delta.description) {
        if (typeof delta.description === 'string') {
            if (delta.description !== course.description) {
                course.description = sanitize(delta.description);
                changed = true;
            }
        }
        else {
            res.status(400).send('Bad Request');
        }
    }

    if (changed) {
        coursesCache[id] = course;
        
        // Writing nearly 2 MB to disk on every patch is not ideal, but that can be fixed later.
        writeFile(COURSE_INFO_PATH, JSON.stringify(coursesCache), { encoding: 'utf-8' });
    }

    res.json(coursesCache[id]);
});

export default coursesRoute;
