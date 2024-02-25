export default {
  categories: {
    bestPicture: {
      value: 16,
      name: "Best Picture",
      nominees: [
        { text: "American Fiction" },
        { text: "Anatomy of a Fall" },
        { text: "Barbie" },
        { text: "The Holdovers" },
        { text: "Killers of the Flower Moon" },
        { text: "Maestro" },
        { text: "Oppenheimer" },
        { text: "Past Lives" },
        { text: "Poor Things" },
        { text: "The Zone of Interest" },
      ],
      order: 0,
    },
    bestActor: {
      value: 8,
      name: "Actor in a Leading Role",
      nominees: [
        { text: "Bradley Cooper", secondaryText: "Maestro" },
        { text: "Colman Domingo", secondaryText: "Rustin" },
        { text: "Paul Giamatti", secondaryText: "The Holdovers" },
        { text: "Cillian Murphy", secondaryText: "Oppenheimer" },
        { text: "Jeffrey Wright", secondaryText: "American Fiction" },
      ],
      order: 1,
    },
    bestActress: {
      value: 8,
      name: "Actress in a Leading Role",
      nominees: [
        { text: "Annette Bening", secondaryText: "Nyad" },
        { text: "Lily Gladstone", secondaryText: "Killers of the Flower Moon" },
        { text: "Sandra Hüller", secondaryText: "Anatomy of a Fall" },
        { text: "Carey Mulligan", secondaryText: "Maestro" },
        { text: "Emma Stone", secondaryText: "Poor Things" },
      ],
      order: 2,
    },
    bestSupportingActor: {
      value: 4,
      name: "Actor in a Supporting Role",
      nominees: [
        { text: "Sterling K. Brown", secondaryText: "American Fiction" },
        { text: "Robert De Niro", secondaryText: "Killers of the Flower Moon" },
        { text: "Robert Downey Jr.", secondaryText: "Oppenheimer" },
        { text: "Ryan Gosling", secondaryText: "Barbie" },
        { text: "Mark Ruffalo", secondaryText: "Poor Things" },
      ],
      order: 3,
    },
    bestSupportingActress: {
      value: 4,
      name: "Actress in a Supporting Role",
      nominees: [
        { text: "Emily Blunt", secondaryText: "Oppenheimer" },
        { text: "Danielle Brooks", secondaryText: "The Color Purple" },
        { text: "America Ferrera", secondaryText: "Barbie" },
        { text: "Jodie Foster", secondaryText: "Nyad" },
        { text: "Da'Vine Joy Randolph", secondaryText: "The Holdovers" },
      ],
      order: 4,
    },
    directing: {
      value: 8,
      name: "Directing",
      nominees: [
        { text: "Anatomy of a Fall", secondaryText: "Justine Triet" },
        {
          text: "Killers of the Flower Moon",
          secondaryText: "Martin Scorsese",
        },
        { text: "Oppenheimer", secondaryText: "Christopher Nolan" },
        { text: "Poor Things", secondaryText: "Yorgos Lanthimos" },
        { text: "The Zone of Interest", secondaryText: "Jonathan Glazer" },
      ],
      order: 5,
    },
    documentaryFeature: {
      value: 4,
      name: "Documentary Feature",
      nominees: [
        { text: "Bobi Wine: The People's President" },
        { text: "The Eternal Memory" },
        { text: "Four Daughters" },
        { text: "To Kill a Tiger" },
        { text: "20 Days in Mariupol" },
      ],
      order: 6,
    },
    internationalFilm: {
      value: 4,
      name: "International Feature Film",
      nominees: [
        { text: "Io Capitano", secondaryText: "Italy" },
        { text: "Perfect Days", secondaryText: "Japan" },
        { text: "Society of the Snow", secondaryText: "Spain" },
        { text: "The Teachers’ Lounge", secondaryText: "Germany" },
        { text: "The Zone of Interest", secondaryText: "United Kingdom" },
      ],
      order: 7,
    },
    animatedFeature: {
      value: 4,
      name: "Animated Feature Film",
      nominees: [
        { text: "The Boy and the Heron" },
        { text: "Elemental" },
        { text: "Nimona" },
        { text: "Robot Dreams" },
        { text: "Spider-Man: Across the Spider-Verse" },
      ],
      order: 8,
    },
    writingAdaptedScreenplay: {
      value: 2,
      name: "Writing (Adapted Screenplay)",
      nominees: [
        { text: "American Fiction" },
        { text: "Barbie" },
        { text: "Oppenheimer" },
        { text: "Poor Things" },
        { text: "The Zone of Interest" },
      ],
      order: 9,
    },
    writingOriginalScreenplay: {
      value: 2,
      name: "Writing (Original Screenplay)",
      nominees: [
        { text: "Anatomy of a Fall" },
        { text: "The Holdovers" },
        { text: "Maestro" },
        { text: "May December" },
        { text: "Past Lives" },
      ],
      order: 10,
    },
    cinematography: {
      value: 2,
      name: "Cinematography",
      nominees: [
        { text: "El Conde" },
        { text: "Killers of the Flower Moon" },
        { text: "Maestro" },
        { text: "Oppenheimer" },
        { text: "Poor Things" },
      ],
      order: 11,
    },
    documentaryShort: {
      value: 2,
      name: "Documentary Short Subject",
      nominees: [
        { text: "The ABCs of Book Banning" },
        { text: "The Barber of Little Rock" },
        { text: "Island in Between" },
        { text: "The Last Repair Shop" },
        { text: "Nǎi Nai & Wài Pó" },
      ],
      order: 12,
    },
    filmEditing: {
      value: 1,
      name: "Film Editing",
      nominees: [
        { text: "Anatomy of a Fall" },
        { text: "The Holdovers" },
        { text: "Killers of the Flower Moon" },
        { text: "Oppenheimer" },
        { text: "Poor Things" },
      ],
      order: 13,
    },
    musicOriginalScore: {
      value: 1,
      name: "Music (Original Score)",
      nominees: [
        {
          text: "American Fiction",
          secondaryText: "Laura Karpman",
        },
        {
          text: "Indiana Jones and the Dial of Destiny",
          secondaryText: "John Williams",
        },
        {
          text: "Killers of the Flower Moon",
          secondaryText: "Robbie Robertson",
        },
        { text: "Oppenheimer", secondaryText: "Ludwig Göransson" },
        { text: "Poor Things", secondaryText: "Jerskin Fendrix" },
      ],
      order: 14,
    },
    musicOriginalSong: {
      value: 1,
      name: "Music (Original Song)",
      nominees: [
        { text: "The Fire Inside", secondaryText: "Flamin' Hot" },
        { text: "I'm Just Ken", secondaryText: "Barbie" },
        { text: "It Never Went Away", secondaryText: "American Symphony" },
        {
          text: "Wahzhazhe (A Song For My People)",
          secondaryText: "Killers of the Flower Moon",
        },
        {
          text: "What Was I Made For?",
          secondaryText: "Barbie",
        },
      ],
      order: 15,
    },
    shortFilmAnimated: {
      value: 1,
      name: "Short Film (Animated)",
      nominees: [
        { text: "Letter to a Pig" },
        { text: "Ninety-Five Senses" },
        { text: "Our Uniform" },
        { text: "Pachyderme" },
        {
          text: "WAR IS OVER! Inspired by the Music of John and Yoko",
        },
      ],
      order: 16,
    },
    shortFilmLiveAction: {
      value: 1,
      name: "Short Film (Live Action)",
      nominees: [
        { text: "The After" },
        { text: "Invincible" },
        { text: "Knight of Fortune" },
        { text: "Red, White and Blue" },
        { text: "The Wonderful Story of Henry Sugar" },
      ],
      order: 17,
    },
    sound: {
      value: 1,
      name: "Sound",
      nominees: [
        { text: "The Creator" },
        { text: "Maestro" },
        { text: "Mission: Impossible - Dead Reckoning Part One" },
        { text: "Oppenheimer" },
        { text: "The Zone of Interest" },
      ],
      order: 18,
    },
    visualEffects: {
      value: 1,
      name: "Visual Effects",
      nominees: [
        { text: "The Creator" },
        { text: "Godzilla Minus One" },
        { text: "Guardians of the Galaxy Vol. 3" },
        { text: "Mission: Impossible - Dead Reckoning Part One" },
        { text: "Napoleon" },
      ],
      order: 19,
    },
    productionDesign: {
      value: 1,
      name: "Production Design",
      nominees: [
        { text: "Barbie" },
        { text: "Killers of the Flower Moon" },
        { text: "Napoleon" },
        { text: "Oppenheimer" },
        { text: "Poor Things" },
      ],
      order: 20,
    },
    costumeDesign: {
      value: 1,
      name: "Costume Design",
      nominees: [
        { text: "Barbie" },
        { text: "Killers of the Flower Moon" },
        { text: "Napoleon" },
        { text: "Oppenheimer" },
        { text: "Poor Things" },
      ],
      order: 21,
    },
    makeupAndHairstyling: {
      value: 1,
      name: "Makeup and Hairstyling",
      nominees: [
        { text: "Golda" },
        { text: "Maestro" },
        { text: "Oppenheimer" },
        { text: "Poor Things" },
        { text: "Society of the Snow" },
      ],
      order: 22,
    },
  },
};