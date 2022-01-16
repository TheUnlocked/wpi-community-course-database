import { Course, DetailedCourse } from "../../server/courses";


export async function fetchCourse(id: number): Promise<DetailedCourse> {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    return data;
}

export async function patchCourse(id: number, patch: Partial<Course>) {
    const res = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patch)
    });
    const data = await res.json();
    return data;
}
