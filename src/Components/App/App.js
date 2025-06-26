import React, {useState} from "react";
import styles from "./App.module.css";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import {Spotify} from "../../util/Spotify/Spotify";

function App () {
  const [searchResults, setSearchResults] = useState([{
    name: "example track name 1",
    artist: "example track artist 1",
    album: "example track album 1",
    id: 1,
  }, 
  {
    name: "example track name 2",
    artist: "example track artist 2",
    album: "example track album 2",
    id: 2,
  }]);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([
    {
      name: "example playlist name 1",
      artist: "example playlist artist 1",
      album: "example playlist album 1",
      id: 1,
    },
    {
      name: "example playlist name 2",
      artist: "example playlist artist 2",
      album: "example playlist album 2",
      id: 2,      
    }
  ]);

    function addTrack(track) {
      const existingTrack = playlistTracks.find((t) => t.id === track.id);    
      const newTrack = playlistTracks.concat(track);
      if (existingTrack) {
        console.log(`Track ${track.name} already exists in the playlist.`);
      } else {
        setPlaylistTracks(newTrack);
        console.log(`Track ${track.name} added to the playlist.`);
      }
    }

    function removeTrack(track) {
    const existingTrack = playlistTracks.filter((t) => t.id !== track.id);
    setPlaylistTracks(existingTrack);
    console.log(`Track ${track.name} removed from the playlist.`);
  }

  function updatePlaylistName(name) {
    setPlaylistName(name);
    console.log(`Playlist name updated to: ${name}`);
  }

  function savePlaylist() {
    const trackURIs = playlistTracks.map((t) => t.uri);
    Spotify.savePlaylist(playlistName, trackURIs).then(() => {
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
      console.log(`Playlist saved: ${playlistName} with tracks: ${trackURIs}`);
    })
  }

  function search(term) {
    Spotify.search(term).then(result => setSearchResults(result));
    console.log(term);
  }

    return (
        <div>
        <h1>
          Ja<span className={styles.highlight}>mmm</span>ing
        </h1>
        <div className={styles.App}>
          {/* <!-- Add a SearchBar component --> */}
          <SearchBar 
          onSearch={search} 
          />
          <div className={styles['App-playlist']}>
            {/* <!-- Add a SearchResults component --> */}
            <SearchResults 
            userSearchResults={searchResults} 
            onAdd={addTrack}
            />
            {/* <!-- Add a Playlist component --> */}
            <Playlist 
            onAdd={addTrack}
            onRemove={removeTrack}
            playlistName={playlistName} 
            playlistTracks={playlistTracks}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
            />
          </div>
        </div>
      </div>
        );
}

export default App;