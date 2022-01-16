import { Component, createRoot, createSignal } from "solid-js";

function createSearch() {
    const [searchValue, setSearchValue] = createSignal('');

    return { searchValue, setSearchValue };
}

export const { searchValue, setSearchValue } = createRoot(createSearch);

export const Searchbox: Component = () => {
    return <ion-searchbar value={searchValue()} on:ionInput={e => {
        setSearchValue(e.target.value ?? '');
    }} />;
};
