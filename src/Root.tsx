import { Link, Route, Routes } from "solid-app-router";
import { Component, Show } from "solid-js";
import CourseDetails from "./course";
import CourseListings from "./courselistings";
import { Searchbox, searchValue } from "./GlobalSearch";

const Root: Component = () => {
    return <>
        <ion-header>
            <ion-toolbar>
                <Link href="/" style={{ color: "unset", "text-decoration": "unset" }}><ion-title>WPI Community Course Database</ion-title></Link>
            </ion-toolbar>
            <Searchbox />
        </ion-header>
        <Routes>
            <Route path="/" element={<ion-content className="ion-padding"><CourseListings /></ion-content>} />
            <Route path="/*all" element={<>
                <ion-content style={{ display: searchValue().length > 0 ? 'none' : 'unset' }} className="ion-padding">
                    <Routes>
                        <Route path="course/:id" element={<CourseDetails />} />
                        <Route path="/*all" element={<h1>404</h1>} />
                    </Routes>
                </ion-content>
                <Show when={searchValue().length > 0}>
                    <ion-content className="ion-padding"><CourseListings /></ion-content>
                </Show>
            </>} />
        </Routes>
        
  </>;
};

export default Root;