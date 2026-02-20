import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('audioplayer.db');

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uri TEXT UNIQUE NOT NULL,
      title TEXT,
      artist TEXT,
      duration REAL,
      album TEXT
    );
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
      song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
      PRIMARY KEY(playlist_id, song_id)
    );
  `);
}

export function upsertSong(song: {
  uri: string;
  title: string;
  artist: string;
  duration: number;
  album: string;
}) {
  db.runSync(
    `INSERT OR REPLACE INTO songs (uri, title, artist, duration, album) VALUES (?, ?, ?, ?, ?)`,
    [song.uri, song.title, song.artist, song.duration, song.album]
  );
}

export function getAllSongs() {
  return db.getAllSync<{
    id: number;
    uri: string;
    title: string;
    artist: string;
    duration: number;
    album: string;
  }>(`SELECT * FROM songs ORDER BY title`);
}

export function createPlaylist(name: string, parentId?: number) {
  const result = db.runSync(
    `INSERT INTO playlists (name, parent_id) VALUES (?, ?)`,
    [name, parentId ?? null]
  );
  return result.lastInsertRowId;
}

export function deletePlaylist(id: number) {
  db.runSync(`DELETE FROM playlists WHERE id = ?`, [id]);
}

export function getPlaylists(parentId?: number) {
  if (parentId === undefined) {
    return db.getAllSync<{ id: number; name: string; parent_id: number | null }>(
      `SELECT * FROM playlists WHERE parent_id IS NULL ORDER BY name`
    );
  }
  return db.getAllSync<{ id: number; name: string; parent_id: number | null }>(
    `SELECT * FROM playlists WHERE parent_id = ? ORDER BY name`,
    [parentId]
  );
}

export function addSongToPlaylist(playlistId: number, songId: number) {
  db.runSync(
    `INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)`,
    [playlistId, songId]
  );
}

export function removeSongFromPlaylist(playlistId: number, songId: number) {
  db.runSync(
    `DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`,
    [playlistId, songId]
  );
}

export function getSongsInPlaylist(playlistId: number) {
  return db.getAllSync<{
    id: number;
    uri: string;
    title: string;
    artist: string;
    duration: number;
    album: string;
  }>(
    `SELECT s.* FROM songs s
     JOIN playlist_songs ps ON s.id = ps.song_id
     WHERE ps.playlist_id = ?
     ORDER BY s.title`,
    [playlistId]
  );
}
