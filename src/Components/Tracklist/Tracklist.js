import React from "react";
import styles from "./Tracklist.module.css";
import Track from "../Track/Track";

function Tracklist (props) {
  
    return (
        <div className={styles.Tracklist}>
        {/* <!-- You will add a map method that renders a set of Track components  --> */}
          {props.userSearchResults.map((track) => (
              <Track 
              track={track} 
              key={track.id}
              onAdd={props.onAdd} 
              onRemove={props.onRemove}
              isRemoval={props.isRemoval} />
            ))}
        </div>
    );
}

export default Tracklist;