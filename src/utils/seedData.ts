import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const GENRES_WITH_SONGS = [
  {
    genre: { name: 'Reggaetón', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' },
    songs: [
      { name: 'Tití Me Preguntó', artist: 'Bad Bunny', duration: '4:03', album: 'Un Verano Sin Ti', releaseDate: '2022-05-06' },
      { name: 'La Jeepeta', artist: 'Nio Garcia', duration: '5:45', album: 'Now or Never', releaseDate: '2020-04-24' },
      { name: 'Bichota', artist: 'Karol G', duration: '2:58', album: 'KG0516', releaseDate: '2020-10-23' }
    ]
  },
  {
    genre: { name: 'Corridos Tumbados', imageUrl: 'https://images.unsplash.com/photo-1588032786045-59cef3952219?w=500&q=80' },
    songs: [
      { name: 'PRC', artist: 'Peso Pluma', duration: '3:04', album: 'Génesis', releaseDate: '2023-01-24' },
      { name: 'AMG', artist: 'Natanael Cano', duration: '2:55', album: 'Nata Montana', releaseDate: '2022-11-24' },
      { name: 'El Azul', artist: 'Junior H', duration: '3:07', album: 'Single', releaseDate: '2023-02-10' }
    ]
  },
  {
    genre: { name: 'Pop Latino', imageUrl: 'https://images.unsplash.com/photo-1493225457224-cca19771311b?w=500&q=80' },
    songs: [
      { name: 'Tacones Rojos', artist: 'Sebastián Yatra', duration: '3:09', album: 'Dharma', releaseDate: '2021-10-21' },
      { name: 'Todo De Ti', artist: 'Rauw Alejandro', duration: '3:19', album: 'Vice Versa', releaseDate: '2021-05-20' },
      { name: 'Despacito', artist: 'Luis Fonsi', duration: '3:48', album: 'Vida', releaseDate: '2017-01-12' }
    ]
  },
  {
    genre: { name: 'Banda', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
    songs: [
      { name: 'El Tóxico', artist: 'Grupo Firme', duration: '3:01', album: 'Nos Divertimos', releaseDate: '2020-03-10' },
      { name: 'A Través del Vaso', artist: 'Banda Los Sebastianes', duration: '3:13', album: 'En Vida', releaseDate: '2018-08-17' },
      { name: 'Hermosa Experiencia', artist: 'Banda MS', duration: '3:40', album: 'No Me Pidas Perdón', releaseDate: '2013-10-21' }
    ]
  },
  {
    genre: { name: 'Norteño', imageUrl: 'https://images.unsplash.com/photo-1508532566027-b2032cd8ecde?w=500&q=80' },
    songs: [
      { name: 'A la Antigüita', artist: 'Calibre 50', duration: '2:46', album: 'Vamos Bien', releaseDate: '2021-02-05' },
      { name: 'Cabrón y Vago', artist: 'El Fantasma', duration: '3:20', album: 'Single', releaseDate: '2020-07-24' },
      { name: 'Chale', artist: 'Edén Muñoz', duration: '2:38', album: 'Consejos Gratis', releaseDate: '2022-02-18' }
    ]
  },
  {
    genre: { name: 'Rock en Español', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
    songs: [
      { name: 'De Música Ligera', artist: 'Soda Stereo', duration: '3:32', album: 'Canción Animal', releaseDate: '1990-12-20' },
      { name: 'Lamento Boliviano', artist: 'Enanitos Verdes', duration: '3:41', album: 'Big Bang', releaseDate: '1994-08-15' },
      { name: 'Oye Mi Amor', artist: 'Maná', duration: '4:33', album: '¿Dónde Jugarán los Niños?', releaseDate: '1992-10-27' }
    ]
  },
  {
    genre: { name: 'Cumbia', imageUrl: 'https://images.unsplash.com/photo-1504609774640-5757913cf004?w=500&q=80' },
    songs: [
      { name: 'Nunca Es Suficiente', artist: 'Los Ángeles Azules', duration: '4:26', album: 'Esto Sí Es Cumbia', releaseDate: '2018-04-19' },
      { name: '17 Años', artist: 'Los Ángeles Azules', duration: '3:18', album: 'Entrega de Amor', releaseDate: '1999-01-01' },
      { name: 'El Listón de tu Pelo', artist: 'Los Ángeles Azules', duration: '3:20', album: 'Una Lluvia De Rosas', releaseDate: '1999-05-18' }
    ]
  },
  {
    genre: { name: 'Hip-Hop / Rap', imageUrl: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=500&q=80' },
    songs: [
      { name: 'Shorty Party', artist: 'Cartel de Santa', duration: '3:45', album: 'Single', releaseDate: '2023-03-04' },
      { name: 'Quevedo Bzrp', artist: 'Bizarrap', duration: '3:18', album: 'Single', releaseDate: '2022-07-06' },
      { name: 'La Jumpa', artist: 'Arcangel', duration: '4:15', album: 'Single', releaseDate: '2022-12-01' }
    ]
  },
  {
    genre: { name: 'Electrónica', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
    songs: [
      { name: 'Pepas', artist: 'Farruko', duration: '4:47', album: 'La 167', releaseDate: '2021-06-24' },
      { name: 'La Mamá de la Mamá', artist: 'El Alfa', duration: '3:05', album: 'Single', releaseDate: '2021-04-06' },
      { name: 'Tijuana Sound Machine', artist: 'Nortec Collective', duration: '4:03', album: 'Tijuana Sound Machine', releaseDate: '2008-05-06' }
    ]
  },
  {
    genre: { name: 'Mariachi / Ranchera', imageUrl: 'https://images.unsplash.com/photo-1520690022415-38b43bd0e0ff?w=500&q=80' },
    songs: [
      { name: 'El Rey', artist: 'Vicente Fernández', duration: '2:55', album: 'Arriba Huentitan', releaseDate: '1972-01-01' },
      { name: 'Si Nos Dejan', artist: 'José Alfredo Jiménez', duration: '2:42', album: 'Clásicos', releaseDate: '1965-01-01' },
      { name: 'La Bikina', artist: 'Luis Miguel', duration: '3:26', album: 'Vivo', releaseDate: '2000-09-12' }
    ]
  }
];

export async function seedDatabase() {
  try {
    const existingGenres = await getDocs(collection(db, 'genres'));
    if (!existingGenres.empty) {
      throw new Error("Ya existen géneros en la base de datos.");
    }

    for (let i = 0; i < GENRES_WITH_SONGS.length; i++) {
      const data = GENRES_WITH_SONGS[i];
      // Insert Genre
      const genreDoc = await addDoc(collection(db, 'genres'), data.genre);
      const genreId = genreDoc.id;

      // Insert 3 Songs for this Genre
      for (let j = 0; j < data.songs.length; j++) {
        const songObj = data.songs[j];
        
        // Search iTunes API for previewUrl and real High Quality Artwork
        let audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        let imageUrl = data.genre.imageUrl;
        let realDuration = songObj.duration;

        try {
           const query = encodeURIComponent(`${songObj.name} ${songObj.artist}`);
           const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
           const result = await response.json();
           if (result.results && result.results.length > 0) {
              const track = result.results[0];
              if (track.previewUrl) audioUrl = track.previewUrl;
              if (track.artworkUrl100) {
                  // Upgrade 100x100 resolution to 600x600 for HD cover
                  imageUrl = track.artworkUrl100.replace("100x100bb", "600x600bb");
              }
              if (track.trackTimeMillis) {
                  const totalSeconds = Math.floor(track.trackTimeMillis / 1000);
                  const m = Math.floor(totalSeconds / 60);
                  const s = totalSeconds % 60;
                  realDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
              }
           }
        } catch (e) {
           console.error("iTunes API error:", e);
        }
        
        await addDoc(collection(db, 'songs'), {
          ...songObj,
          duration: realDuration,
          imageUrl: imageUrl, // Real cover
          genreId,
          musicUrl: audioUrl // Real 30-sec preview file directly from iTunes
        });
      }
    }
  } catch (error) {
    console.error("Error sembrando base de datos:", error);
    throw error;
  }
}
