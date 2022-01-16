import { Component, createEffect, createResource, createSignal } from "solid-js";
import jsonFetcher from "../api/jsonFetcher";

import styles from './index.module.css';

export interface SourceButtonProps {
    endpoint: string;
    endpointSpecific?: string;
}

const SourceButton: Component<SourceButtonProps> = props => {
    const [isDialogOpen, setIsDialogOpen] = createSignal(false);

    const [request] = createResource(props.endpointSpecific ?? props.endpoint, jsonFetcher);

    const modal = <ion-modal className={styles.modalWithToolbar} is-open={isDialogOpen()}>
        <ion-header>
            <ion-toolbar><ion-title>API Request</ion-title></ion-toolbar>
        </ion-header>
        <ion-content scroll-x force-overscroll className="ion-padding">
            <pre>GET {props.endpoint}{'\n'}{props.endpointSpecific ? `GET ${props.endpointSpecific}` : undefined}</pre>
            <pre style={{ overflow: "unset" }}>
                {request.loading ? 'Loading...'
                    : request.error ?? JSON.stringify(request(), undefined, 4)}
            </pre>
        </ion-content>
    </ion-modal> as HTMLIonModalElement;

    createEffect(() => {
        if (isDialogOpen()) {
            modal.onWillDismiss().then(() => setIsDialogOpen(false));
        }
    });

    return <>
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button on:click={() => setIsDialogOpen(true)} color="dark">
                <ion-icon icon="code" />
            </ion-fab-button>
        </ion-fab>
        {modal}
    </>;
};

export default SourceButton;