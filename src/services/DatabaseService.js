import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
    db = await SQLite.openDatabaseAsync('audioplayer.db');
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT,
      artist TEXT,
      album TEXT,
      duration INTEGER,
      url TEXT,
      artwork TEXT
    );
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      parent_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlist_id INTEGER,
      song_id TEXT,
      FOREIGN KEY (playlist_id) REFERENCES playlists (id),
      FOREIGN KEY (song_id) REFERENCES songs (id)
    );
  `);
};

export const getDatabase = () => db;

export const insertSongs = async (songs) => {
    if (!db) await initDatabase();

    for (const song of songs) {
        await db.runAsync(
            'INSERT OR REPLACE INTO songs (id, title, artist, album, duration, url, artwork) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [song.id, song.title, song.artist, song.album, song.duration, song.url, song.artwork]
        );
    }
};

export const getAllSongs = async () => {
    if (!db) await initDatabase();
    return await db.getAllAsync('SELECT * FROM songs ORDER BY title ASC');
};

export const createPlaylist = async (name, parentId = null) => {
    if (!db) await initDatabase();
    return await db.runAsync('INSERT INTO playlists (name, parent_id) VALUES (?, ?)', [name, parentId]);
};

export const getPlaylists = async (parentId = null) => {
    if (!db) await initDatabase();
    const query = parentId === null
        ? 'SELECT * FROM playlists WHERE parent_id IS NULL'
        : 'SELECT * FROM playlists WHERE parent_id = ?';
    const params = parentId === null ? [] : [parentId];
    return await db.getAllAsync(query, params);
};

export const deletePlaylist = async (id) => {
    if (!db) await initDatabase();
    // Recursive delete? For now just delete the playlist.
    await db.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM playlist_songs WHERE playlist_id = ?', [id]);
};

export const addSongToPlaylist = async (playlistId, songId) => {
    if (!db) await initDatabase();
    // Check key constraint or duplicate
    // [3.4] No duplicate songs
    const existing = await db.getAllAsync('SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?', [playlistId, songId]);
    if (existing.length === 0) {
        await db.runAsync('INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)', [playlistId, songId]);
    }
};

export const getPlaylistSongs = async (playlistId) => {
    if (!db) await initDatabase();
    return await db.getAllAsync(`
        SELECT s.* FROM songs s
        JOIN playlist_songs ps ON s.id = ps.song_id
        WHERE ps.playlist_id = ?
    `, [playlistId]);
};
