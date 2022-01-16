import { InfiniteScrollCustomEvent, InputCustomEvent, JSX as IonicJSX, SearchbarCustomEvent } from '@ionic/core/components';
import { JSX as QuillJSX } from 'stencil-quill';
import { JSX, PropsWithChildren } from 'solid-js';

interface RawIonicElements extends IonicJSX.IntrinsicElements {
    'ion-icon': IonicJSX.IonIcon;
} 

type IonicElements = { [E in keyof RawIonicElements]: PropsWithChildren<RawIonicElements[E] & {
    className?: string;
    style?: JSX.CSSProperties;
    slot?: string;
} & { [Ev in keyof HTMLElementEventMap as `on:${Ev}`]?: (e: HTMLElementEventMap[Ev]) => void }> };

type FixEvents<T> = {
    [E in keyof T]
        : { [Ev in keyof T[E] as Ev extends `on${infer F}${infer R}`
            ? F extends ':'
            ? Ev
            : `on:${Lowercase<F>}${R}`
            : Ev
        ]: T[E][Ev] }
};

declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements extends FixEvents<IonicElements & QuillJSX.IntrinsicElements> {
            'ion-infinite-scroll': { 'on:ionInfinite'?: (e: InfiniteScrollCustomEvent) => void } & IonicElements['ion-infinite-scroll'];
            'ion-searchbar': { 'on:ionInput'?: (e: SearchbarCustomEvent) => void } & IonicElements['ion-searchbar'];
            'ion-input': { 'on:ionInput'?: (e: InputCustomEvent) => void } & IonicElements['ion-input'];
        }
        interface HTMLAttributes<T> {
            slot?: string;
        }
    }
}
