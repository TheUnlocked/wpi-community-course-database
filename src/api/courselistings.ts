import { Course } from "../../server/courses";


export default async function fetchCourseListings(): Promise<Course[]> {
    const res = await fetch('/api/courses/all');
    const data = await res.json();
    return data;
}