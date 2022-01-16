import { Component, createSignal, For } from "solid-js";

const ChipMaker: Component<{
    placeholder?: string;
    chips: string[];
    makeChip: (name: string) => void;
    removeChip: (index: number) => void;
}> = props => {
    const [newChipValue, setNewChipValue] = createSignal('');

    return <>
        <For each={props.chips}>
            {(alias, index) => <ion-chip on:click={() => props.removeChip(index())}>
                <ion-label>{alias}</ion-label>
                <ion-icon name="close-circle" color="dark" />
            </ion-chip>}
        </For>
        <ion-chip>
            <ion-input
                placeholder={props.placeholder ?? "New item..."} type="text" size={10}
                value={newChipValue()}
                on:ionInput={e => setNewChipValue(e.target.value?.toString() ?? '')}
                on:keyup={e => {
                    if (e.key === 'Enter') {
                        props.makeChip(newChipValue());
                        setNewChipValue('');
                    }
                }}
                on:keydown={e => {
                    if (e.key === 'Backspace' && newChipValue().length === 0) {
                        props.removeChip(props.chips.length - 1);
                    }
                }} />
            <ion-icon name="add" color="dark" on:click={() => {
                props.makeChip(newChipValue());
                setNewChipValue('');
            }} />
        </ion-chip>
    </>;
};

export default ChipMaker;