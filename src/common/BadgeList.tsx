import { Component, PropsWithChildren } from "solid-js";

import styles from './index.module.css';

const BadgeList: Component<PropsWithChildren<{}>> = props => {
    return <span className={styles.badgeList}>
        {props.children}
    </span>;
}

export default BadgeList;