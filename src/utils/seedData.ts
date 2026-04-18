import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const GENRES_WITH_SONGS = [
  {
    genre: { name: 'Mariachi', imageUrl: 'https://images.unsplash.com/photo-1520690022415-38b43bd0e0ff?w=500&q=80' },
    songs: [
      { name: 'El Son de la Negra', artist: 'Mariachi Vargas de Tecalitlán', duration: '2:50', album: 'El Mejor Mariachi del Mundo', releaseDate: '1940-01-01' },
      { name: 'México Lindo y Querido', artist: 'Jorge Negrete', duration: '3:05', album: 'Fiesta Mexicana', releaseDate: '1948-01-01' },
      { name: 'El Rey', artist: 'Vicente Fernández', duration: '2:29', album: 'El Hijo del Pueblo', releaseDate: '1974-01-01' },
      { name: 'La Bikina', artist: 'Luis Miguel', duration: '2:58', album: 'Vivo', releaseDate: '2000-01-01' },
      { name: 'Cielito Lindo', artist: 'Pedro Infante', duration: '2:35', album: 'La Voz de México', releaseDate: '1945-01-01' }
    ]
  },
  {
    genre: { name: 'Banda Sinaloense', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&q=80' },
    songs: [
      { name: 'El Sinaloense', artist: 'Banda El Recodo', duration: '2:45', album: 'Banda El Recodo de Cruz Lizárraga', releaseDate: '1958-01-01' },
      { name: 'Mi Gusto Es', artist: 'Antonio Aguilar', duration: '2:52', album: 'Mi Gusto Es', releaseDate: '1968-01-01' },
      { name: 'El Muchacho Alegre', artist: 'Francisco "El Gallo" Elizalde', duration: '2:40', album: 'El Muchacho Alegre', releaseDate: '2004-01-01' },
      { name: 'Me Gusta Todo De Ti', artist: 'Banda El Recodo', duration: '3:02', album: 'Me Gusta Todo De Ti', releaseDate: '2009-01-01' },
      { name: 'Te Hubieras Ido Antes', artist: 'Julión Álvarez', duration: '3:34', album: 'Soy Lo Que Quiero: Indispensable', releaseDate: '2013-01-01' }
    ]
  },
  {
    genre: { name: 'Norteño', imageUrl: 'https://images.unsplash.com/photo-1508532566027-b2032cd8ecde?w=500&q=80' },
    songs: [
      { name: 'La Puerta Negra', artist: 'Los Tigres del Norte', duration: '3:24', album: 'Gracias! América... Sin Fronteras', releaseDate: '1986-01-01' },
      { name: 'Tragos Amargos', artist: 'Ramón Ayala', duration: '2:50', album: 'Tragos Amargos', releaseDate: '1980-01-01' },
      { name: 'Mi Casa Nueva', artist: 'Los Invasores de Nuevo León', duration: '2:45', album: 'Mi Casa Nueva', releaseDate: '1985-01-01' },
      { name: 'Eslabón por Eslabón', artist: 'Lalo Mora', duration: '2:55', album: 'Mis 20 Mejores Canciones', releaseDate: '1993-01-01' },
      { name: 'Laurita Garza', artist: 'Los Invasores de Nuevo León', duration: '3:15', album: 'Laurita Garza', releaseDate: '1981-01-01' }
    ]
  },
  {
    genre: { name: 'Ranchera', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
    songs: [
      { name: 'Volver, Volver', artist: 'Vicente Fernández', duration: '2:57', album: '¡Arriba Huentitán!', releaseDate: '1972-01-01' },
      { name: 'Paloma Negra', artist: 'Chavela Vargas', duration: '3:25', album: 'Chavela Vargas', releaseDate: '1961-01-01' },
      { name: 'Cucurrucucú Paloma', artist: 'Lola Beltrán', duration: '3:45', album: 'La Grande', releaseDate: '1954-01-01' },
      { name: 'Fallaste Corazón', artist: 'Cuco Sánchez', duration: '3:05', album: 'Fallaste Corazón', releaseDate: '1955-01-01' },
      { name: 'Amanecí en Tus Brazos', artist: 'José Alfredo Jiménez', duration: '2:30', album: 'La Voz de México', releaseDate: '1954-01-01' }
    ]
  },
  {
    genre: { name: 'Corridos Tumbados', imageUrl: 'https://images.unsplash.com/photo-1588032786045-59cef3952219?w=500&q=80' },
    songs: [
      { name: 'Ella Baila Sola', artist: 'Eslabón Armado & Peso Pluma', duration: '2:45', album: 'Desvelado', releaseDate: '2023-01-01' },
      { name: 'AMG', artist: 'Natanael Cano, Peso Pluma & Gabito Ballesteros', duration: '2:32', album: 'Nata Montana', releaseDate: '2022-01-01' },
      { name: 'Soy El Diablo', artist: 'Natanael Cano', duration: '3:11', album: 'Todo Es Diferente', releaseDate: '2019-01-01' },
      { name: 'Ch y la Pizza', artist: 'Fuerza Regida & Natanael Cano', duration: '2:16', album: 'Pa Que Hablen', releaseDate: '2022-01-01' },
      { name: 'Lady Gaga', artist: 'Peso Pluma, Gabito Ballesteros & Junior H', duration: '3:32', album: 'GÉNESIS', releaseDate: '2023-01-01' }
    ]
  },
  {
    genre: { name: 'Huapango / Son Huasteco', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
    songs: [
      { name: 'La Malagueña', artist: 'Miguel Aceves Mejía', duration: '3:15', album: 'El Rey del Falsete', releaseDate: '1947-01-01' },
      { name: 'El Querreque', artist: 'Trío Huasteco', duration: '3:20', album: 'Antología del Son', releaseDate: '1960-01-01' },
      { name: 'La Cigarra', artist: 'Aida Cuevas', duration: '3:40', album: 'La Voz de México', releaseDate: '1980-01-01' },
      { name: 'El Pastor', artist: 'Miguel Aceves Mejía', duration: '3:05', album: 'El Pastor (Sencillo)', releaseDate: '1950-01-01' },
      { name: 'Serenata Huasteca', artist: 'José Alfredo Jiménez', duration: '2:45', album: 'José Alfredo Jiménez Vol. 1', releaseDate: '1953-01-01' }
    ]
  },
  {
    genre: { name: 'Son Jarocho', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80' },
    songs: [
      { name: 'La Bamba', artist: 'Ritchie Valens', duration: '2:03', album: 'Ritchie Valens', releaseDate: '1958-01-01' },
      { name: 'El Cascabel', artist: 'Lorenzo Barcelata', duration: '3:10', album: 'Clásicos del Son', releaseDate: '1944-01-01' },
      { name: 'La Bruja', artist: 'Tlen Huicani', duration: '4:15', album: 'Arpa Jarocha', releaseDate: '1985-01-01' },
      { name: 'El Colás', artist: 'Los Cojolites', duration: '3:50', album: 'No Todo Es Silencio', releaseDate: '2008-01-01' },
      { name: 'Zapateado Jarocho', artist: 'Conjunto Alma Jarocha', duration: '2:55', album: 'México: Son Jarocho', releaseDate: '1965-01-01' }
    ]
  },
  {
    genre: { name: 'Bolero', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
    songs: [
      { name: 'Bésame Mucho', artist: 'Consuelo Velázquez', duration: '3:12', album: 'Éxitos de Oro', releaseDate: '1940-01-01' },
      { name: 'Sabor a Mí', artist: 'Álvaro Carrillo', duration: '2:55', album: 'Cancionero', releaseDate: '1959-01-01' },
      { name: 'La Barca', artist: 'Lucho Gatica', duration: '3:08', album: 'Inolvidables', releaseDate: '1957-01-01' },
      { name: 'Contigo Aprendí', artist: 'Armando Manzanero', duration: '3:05', album: 'A Mi Amor Con Mi Amor', releaseDate: '1967-01-01' },
      { name: 'Gema', artist: 'Los Dandys', duration: '2:40', album: 'Los Dandys', releaseDate: '1958-01-01' }
    ]
  },
  {
    genre: { name: 'Rock en Español', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
    songs: [
      { name: 'La Célula que Explota', artist: 'Caifanes', duration: '3:33', album: 'El Diablito', releaseDate: '1990-01-01' },
      { name: 'Eres', artist: 'Café Tacvba', duration: '4:30', album: 'Cuatro Caminos', releaseDate: '2003-01-01' },
      { name: 'Rayando el Sol', artist: 'Maná', duration: '4:11', album: 'Falta Amor', releaseDate: '1990-01-01' },
      { name: 'Pachuco', artist: 'Maldita Vecindad', duration: '3:14', album: 'El Circo', releaseDate: '1991-01-01' },
      { name: 'Gimme the Power', artist: 'Molotov', duration: '4:10', album: '¿Dónde Jugarán las Niñas?', releaseDate: '1997-01-01' }
    ]
  },
  {
    genre: { name: 'Pop Latino', imageUrl: 'https://images.unsplash.com/photo-1493225457224-cca19771311b?w=500&q=80' },
    songs: [
      { name: 'Causa y Efecto', artist: 'Paulina Rubio', duration: '3:23', album: 'Gran City Pop', releaseDate: '2009-01-01' },
      { name: 'Muriendo Lento', artist: 'Moderatto ft. Belinda', duration: '4:12', album: 'Detector de Metal', releaseDate: '2004-01-01' },
      { name: 'Limón y Sal', artist: 'Julieta Venegas', duration: '3:28', album: 'Limón y Sal', releaseDate: '2006-01-01' },
      { name: 'Corre!', artist: 'Jesse & Joy', duration: '4:45', album: '¿Con Quién Se Queda El Perro?', releaseDate: '2011-01-01' },
      { name: 'Hasta la Raíz', artist: 'Natalia Lafourcade', duration: '3:42', album: 'Hasta la Raíz', releaseDate: '2015-01-01' }
    ]
  },
  {
    genre: { name: 'Cumbia Mexicana', imageUrl: 'https://images.unsplash.com/photo-1504609774640-5757913cf004?w=500&q=80' },
    songs: [
      { name: '17 Años', artist: 'Los Ángeles Azules', duration: '2:55', album: 'Una Lluvia de Rosas', releaseDate: '1999-01-01' },
      { name: 'Cómo Te Voy a Olvidar', artist: 'Los Ángeles Azules', duration: '4:32', album: 'Inolvidables', releaseDate: '1996-01-01' },
      { name: 'Oye Mujer', artist: 'Raymix', duration: '4:05', album: 'Oye Mujer', releaseDate: '2017-01-01' },
      { name: 'La Colegiala', artist: 'Margarita La Diosa de la Cumbia', duration: '3:45', album: 'Margarita', releaseDate: '1990-01-01' },
      { name: 'Cumbia del Garrote', artist: 'Los Kumbia Kings', duration: '3:20', album: '4', releaseDate: '2003-01-01' }
    ]
  },
  {
    genre: { name: 'Ska / Rock Mestizo', imageUrl: 'https://images.unsplash.com/photo-1533174000265-e8cf28148b17?w=500&q=80' },
    songs: [
      { name: 'Kumbala', artist: 'Maldita Vecindad', duration: '4:27', album: 'El Circo', releaseDate: '1991-01-01' },
      { name: 'Dormir Soñando', artist: 'El Gran Silencio', duration: '3:05', album: 'Libres y Locos', releaseDate: '1998-01-01' },
      { name: 'Amargo Adiós', artist: 'Inspector', duration: '3:03', album: 'Alma en Fuego', releaseDate: '1999-01-01' },
      { name: 'Perfume de Gardenias', artist: 'Panteón Rococó', duration: '4:08', album: 'Ni Carne Ni Pescado', releaseDate: '2010-01-01' },
      { name: 'La Carencia', artist: 'Panteón Rococó', duration: '3:34', album: 'Compañeros Musicales', releaseDate: '2002-01-01' }
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
        let previewUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        let imageUrl = data.genre.imageUrl;
        let realDuration = songObj.duration;

        try {
           const query = encodeURIComponent(`${songObj.name} ${songObj.artist}`);
           const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
           const result = await response.json();
           if (result.results && result.results.length > 0) {
              const track = result.results[0];
              if (track.previewUrl) previewUrl = track.previewUrl;
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
        
        // Use the exact song name for the local file path
        const localMusicPath = `/music/${songObj.name}.mp3`;

        await addDoc(collection(db, 'songs'), {
          ...songObj,
          duration: realDuration,
          imageUrl: imageUrl, // Real cover
          genreId,
          musicUrl: localMusicPath, // Main exact local path
          previewUrl: previewUrl // Fallback 30-sec preview file
        });
      }
    }
  } catch (error) {
    console.error("Error sembrando base de datos:", error);
    throw error;
  }
}
