import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MUSIC_LINKS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
];

const GENRES_WITH_SONGS = [
  {
    genre: { name: 'Reggaetón', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' },
    songs: [
      { name: 'Tití Me Preguntó', artist: 'Bad Bunny', duration: '4:03', album: 'Un Verano Sin Ti', releaseDate: '2022-05-06', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' },
      { name: 'La Jeepeta', artist: 'Nio Garcia', duration: '5:45', album: 'Now or Never', releaseDate: '2020-04-24', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
      { name: 'Bichota', artist: 'Karol G', duration: '2:58', album: 'KG0516', releaseDate: '2020-10-23', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Corridos Tumbados', imageUrl: 'https://images.unsplash.com/photo-1588032786045-59cef3952219?w=500&q=80' },
    songs: [
      { name: 'PRC', artist: 'Peso Pluma, Natanael Cano', duration: '3:04', album: 'Génesis', releaseDate: '2023-01-24', imageUrl: 'https://images.unsplash.com/photo-1588032786045-59cef3952219?w=500&q=80' },
      { name: 'AMG', artist: 'Natanael Cano', duration: '2:55', album: 'Nata Montana', releaseDate: '2022-11-24', imageUrl: 'https://images.unsplash.com/photo-1520690022415-38b43bd0e0ff?w=500&q=80' },
      { name: 'El Azul', artist: 'Junior H', duration: '3:07', album: 'Single', releaseDate: '2023-02-10', imageUrl: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Pop Latino', imageUrl: 'https://images.unsplash.com/photo-1493225457224-cca19771311b?w=500&q=80' },
    songs: [
      { name: 'Tacones Rojos', artist: 'Sebastián Yatra', duration: '3:09', album: 'Dharma', releaseDate: '2021-10-21', imageUrl: 'https://images.unsplash.com/photo-1493225457224-cca19771311b?w=500&q=80' },
      { name: 'Todo De Ti', artist: 'Rauw Alejandro', duration: '3:19', album: 'Vice Versa', releaseDate: '2021-05-20', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
      { name: 'Despacito', artist: 'Luis Fonsi', duration: '3:48', album: 'Vida', releaseDate: '2017-01-12', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Banda', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
    songs: [
      { name: 'El Tóxico', artist: 'Grupo Firme', duration: '3:01', album: 'Nos Divertimos', releaseDate: '2020-03-10', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
      { name: 'A Través del Vaso', artist: 'Banda Los Sebastianes', duration: '3:13', album: 'En Vida', releaseDate: '2018-08-17', imageUrl: 'https://images.unsplash.com/photo-1533174000265-e8cf28148b17?w=500&q=80' },
      { name: 'Hermosa Experiencia', artist: 'Banda MS', duration: '3:40', album: 'No Me Pidas Perdón', releaseDate: '2013-10-21', imageUrl: 'https://images.unsplash.com/photo-1524650359799-842906ca1ce4?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Norteño', imageUrl: 'https://images.unsplash.com/photo-1508532566027-b2032cd8ecde?w=500&q=80' },
    songs: [
      { name: 'A la Antigüita', artist: 'Calibre 50', duration: '2:46', album: 'Vamos Bien', releaseDate: '2021-02-05', imageUrl: 'https://images.unsplash.com/photo-1508532566027-b2032cd8ecde?w=500&q=80' },
      { name: 'Cabrón y Vago', artist: 'El Fantasma', duration: '3:20', album: 'Single', releaseDate: '2020-07-24', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&q=80' },
      { name: 'Chale', artist: 'Edén Muñoz', duration: '2:38', album: 'Consejos Gratis', releaseDate: '2022-02-18', imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Rock en Español', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
    songs: [
      { name: 'De Música Ligera', artist: 'Soda Stereo', duration: '3:32', album: 'Canción Animal', releaseDate: '1990-12-20', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
      { name: 'Lamento Boliviano', artist: 'Enanitos Verdes', duration: '3:41', album: 'Big Bang', releaseDate: '1994-08-15', imageUrl: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=500&q=80' },
      { name: 'Oye Mi Amor', artist: 'Maná', duration: '4:33', album: '¿Dónde Jugarán los Niños?', releaseDate: '1992-10-27', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Cumbia', imageUrl: 'https://images.unsplash.com/photo-1504609774640-5757913cf004?w=500&q=80' },
    songs: [
      { name: 'Nunca Es Suficiente', artist: 'Los Ángeles Azules', duration: '4:26', album: 'Esto Sí Es Cumbia', releaseDate: '2018-04-19', imageUrl: 'https://images.unsplash.com/photo-1504609774640-5757913cf004?w=500&q=80' },
      { name: '17 Años', artist: 'Los Ángeles Azules', duration: '3:18', album: 'Entrega de Amor', releaseDate: '1999-01-01', imageUrl: 'https://images.unsplash.com/photo-1533174000265-e8cf28148b17?w=500&q=80' },
      { name: 'El Listón de tu Pelo', artist: 'Los Ángeles Azules', duration: '3:20', album: 'Una Lluvia De Rosas', releaseDate: '1999-05-18', imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Hip-Hop / Rap Centro', imageUrl: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=500&q=80' },
    songs: [
      { name: 'Shorty Party', artist: 'Cartel de Santa', duration: '3:45', album: 'Single', releaseDate: '2023-03-04', imageUrl: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?w=500&q=80' },
      { name: 'Bzrp Sessions', artist: 'Bizarrap, Quevedo', duration: '3:18', album: 'Single', releaseDate: '2022-07-06', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
      { name: 'Dembow', artist: 'Emilia', duration: '2:56', album: 'Single', releaseDate: '2022-07-14', imageUrl: 'https://images.unsplash.com/photo-1516280440502-d9db3addbd57?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Electrónica', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
    songs: [
      { name: 'Pepas', artist: 'Farruko', duration: '4:47', album: 'La 167', releaseDate: '2021-06-24', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
      { name: 'La Mamá de la Mamá', artist: 'El Alfa', duration: '3:05', album: 'Single', releaseDate: '2021-04-06', imageUrl: 'https://images.unsplash.com/photo-1549834185-32247cc9d115?w=500&q=80' },
      { name: 'El Techno del Norte', artist: 'Nortec Collective', duration: '4:03', album: 'Tijuana Sound Machine', releaseDate: '2008-05-06', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' }
    ]
  },
  {
    genre: { name: 'Mariachi / Ranchera', imageUrl: 'https://images.unsplash.com/photo-1520690022415-38b43bd0e0ff?w=500&q=80' },
    songs: [
      { name: 'El Rey', artist: 'Vicente Fernández', duration: '2:55', album: 'Arriba Huentitan', releaseDate: '1972-01-01', imageUrl: 'https://images.unsplash.com/photo-1520690022415-38b43bd0e0ff?w=500&q=80' },
      { name: 'Si Nos Dejan', artist: 'José Alfredo Jiménez', duration: '2:42', album: 'Clásicos', releaseDate: '1965-01-01', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
      { name: 'La Bikina', artist: 'Luis Miguel', duration: '3:26', album: 'Vivo', releaseDate: '2000-09-12', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' }
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
        const audioUrl = MUSIC_LINKS[j % MUSIC_LINKS.length];
        
        await addDoc(collection(db, 'songs'), {
          ...songObj,
          genreId,
          musicUrl: audioUrl
        });
      }
    }
  } catch (error) {
    console.error("Error sembrando base de datos:", error);
    throw error;
  }
}
