import { Component } from "solid-js";

const AvailabilityBadge: Component<{ availability: string }> = props => {
    return <ion-badge slot="end" color={{ 'open': 'primary', 'waitlist': 'warning', 'filled': 'danger'}[props.availability]}>
        {{ 'open': 'Open', 'waitlist': 'Waitlist Only', 'filled': 'Waitlist Full'}[props.availability]}
    </ion-badge>;
}

export default AvailabilityBadge;