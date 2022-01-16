import sanitizeHtml from "sanitize-html";
import { useParams } from "solid-app-router";
import { Component, createEffect, createMemo, createResource, createSignal, For, Match, Show, Suspense, Switch } from "solid-js";
import { Offering } from "../../server/courses";
import { fetchCourse, patchCourse } from "../api/course";
import AvailabilityBadge from "../common/AvailabilityBadge";
import BadgeList from "../common/BadgeList";
import ChipMaker from "../common/ChipMaker";
import SourceButton from "../common/SourceButton";

import styles from './index.module.css';
import SectionScheduleDisplay from "./SectionScheduleDisplay";


const CourseDetails: Component = () => {
    const params = useParams();

    const [course, { mutate: mutateCourse, refetch: refetchCourse }] = createResource(() => +params.id, fetchCourse);

    const [editMode, setEditMode] = createSignal(false);

    function toggleEdit(e?: MouseEvent) {
        setEditMode(x => !x);
        e?.preventDefault();
    }

    async function saveChanges() {
        await patchCourse(+params.id, { description: course()?.description, aliases: course()?.aliases });
        refetchCourse();
        toggleEdit();
    }

    const description = createMemo(() => sanitizeHtml(course()?.description ?? ''));

    return <Suspense>
        <SourceButton endpoint="/api/courses/:id" endpointSpecific={`/api/courses/${params.id}`} />
        <div className={styles.container}>
            <BadgeList>
                <ion-badge color="tertiary">{course()?.departmentSymbol}</ion-badge>
                <AvailabilityBadge availability={course()?.availability!} />
            </BadgeList>
            <h1>{course()?.title}</h1>
            <p>{course()?.departmentSymbol} {course()?.courseNumber}</p>

            <Show when={editMode()} fallback={<>
                {/* View mode */}
                <Show when={course()?.aliases.length ?? 0 > 0}>
                    <p><ion-badge color="none" className={styles.inlineBadge}>AKA</ion-badge> {course()?.aliases.join(', ')}</p>
                </Show>
                
                <h2>Description</h2>
                <p innerHTML={description()} />
                <p className={styles.editSuggestion}><em>Description need tweaking? <a href="#" onClick={toggleEdit}>Make an edit!</a></em></p>
                
                <h2>Sections</h2>
                <ion-grid>
                    <ion-row>
                        <For each={course()?.offerings}>
                            {offering => <ion-col size="12" size-lg="6">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>{offering.section}</ion-card-title>
                                        <ion-card-subtitle>{offering.instructor || 'Unknown Professor'}</ion-card-subtitle>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <Switch fallback={<ion-badge color="danger" className={styles.availabilityBadge}>Waitlist Full</ion-badge>}>
                                            <Match when={offering.availability === 'open'}>
                                                <ion-badge className={styles.availabilityBadge}>Open</ion-badge>
                                                {offering.enrolled}/{offering.capacity}
                                            </Match>
                                            <Match when={offering.availability === 'waitlist'}>
                                                <ion-badge color="warning" className={styles.availabilityBadge}>Waitlist</ion-badge>
                                                {offering.waitlistOccupied}/{offering.waitlistCapacity}
                                            </Match>
                                        </Switch>
                                    </ion-card-content>
                                    <SectionScheduleDisplay section={offering}/>
                                    <hr />
                                    <ion-button fill="clear" expand="block" target="_blank" href="https://hub.wpi.edu/io/Add-Drop">Go to add/drop form</ion-button>
                                </ion-card>
                            </ion-col>}
                        </For>
                    </ion-row>
                </ion-grid>
            </>}>
                {/* Edit mode */}
                <p>
                    <ion-badge color="none" className={styles.inlineBadge}>AKA</ion-badge>
                    <ChipMaker
                        chips={course()?.aliases ?? []}
                        placeholder="New alias..."
                        makeChip={newAlias => mutateCourse(prev => prev ? { ...prev, aliases: [...new Set([...prev?.aliases, newAlias])].filter(Boolean) } : undefined)}
                        removeChip={index => mutateCourse(prev => {
                            if (!prev) return prev;
                            const aliases = [...prev.aliases];
                            aliases.splice(index, 1);
                            return { ...prev, aliases };
                        })} />
                </p>

                <h2>Description</h2>
                <p>
                    <quill-editor format="html" theme="bubble" modules={JSON.stringify({
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons

                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent

                            ['clean'],                                         // remove formatting button
                            ['link']
                        ]
                        })}
                        content={course()?.description}
                        on:editorContentChange={e => mutateCourse(prev => prev ? { ...prev, description: e.detail.html } : undefined)} />
                </p>
                <ion-button on:click={saveChanges}>Save Changes</ion-button>
            </Show>
        </div>
    </Suspense>;
};

export default CourseDetails;