export default {
  categories: {
    bestMotionPictureDrama: {
      value: 16,
      name: "Best Motion Picture - Drama",
      nominees: [
        { text: "Anatomy of a Fall" },
        { text: "Killers of the Flower Moon" },
        { text: "Maestro" },
        { text: "Oppenheimer" },
        { text: "Past Lives" },
        { text: "The Zone of Interest" },
      ],
      order: 0,
    },
    bestMotionPictureMusicalComedy: {
      value: 16,
      name: "Best Motion Picture - Musical or Comedy",
      nominees: [
        { text: "Air" },
        { text: "American Fiction" },
        { text: "Barbie" },
        { text: "The Holdovers" },
        { text: "May December" },
        { text: "Poor Things" },
      ],
      order: 1,
    },
    animatedFeature: {
      value: 4,
      name: "Best Motion Picture - Animated",
      nominees: [
        { text: "The Boy and the Heron" },
        { text: "Elemental" },
        { text: "Spider-Man: Across the Spider-Verse" },
        { text: "Suzume" },
        { text: "The Super Mario Bros. Movie" },
        { text: "Wish" },
      ],
      order: 19,
    },
    boxOfficeFeature: {
      value: 4,
      name: "Cinematic and Box Office Achievement",
      nominees: [
        { text: "Barbie" },
        { text: "Guardians of the Galaxy Vol. 3" },
        { text: "John Wick: Chapter 4" },
        {
          text: "Mission: Impossible - Dead Reckoning Part 1",
          movieDBName: "Mission: Impossible - Dead Reckoning Part One",
        },
        { text: "Oppenheimer" },
        { text: "Spider-Man: Across the Spider-Verse" },
        {
          text: "Taylor Swift: The Eras Tour",
          movieDBName: "TAYLOR SWIFT | THE ERAS TOUR",
        },
        { text: "The Super Mario Bros. Movie" },
      ],
      order: 19,
    },
    foreignLanguageFile: {
      value: 4,
      name: "Best Motion Picture – Non-English Language",
      nominees: [
        { text: "Anatomy of a Fall" },
        { text: "Fallen Leaves" },
        { text: "Io Capitano" },
        { text: "Past Lives" },
        { text: "Society of the Snow" },
        { text: "The Zone of Interest" },
      ],
      order: 21,
    },
    bestActressDrama: {
      value: 8,
      name: "Best Performance by a Female Actor in a Motion Picture – Drama",
      nominees: [
        {
          text: "Annette Bening",
          secondaryText: "Nyad",
        },
        {
          text: "Cailee Spaeny",
          secondaryText: "Priscilla",
        },
        {
          text: "Carey Mulligan",
          secondaryText: "Maestro",
        },
        {
          text: "Greta Lee",
          secondaryText: "Past Lives",
        },
        {
          text: "Lily Gladstone",
          secondaryText: "Killers of the Flower Moon",
        },
        {
          text: "Sandra Hüller",
          secondaryText: "Anatomy of a Fall",
        },
      ],
      order: 5,
    },
    bestActorDrama: {
      value: 8,
      name: "Best Performance by a Male Actor in a Motion Picture – Drama",
      nominees: [
        {
          text: "Andrew Scott",
          secondaryText: "All of Us Strangers",
        },
        {
          text: "Barry Keoghan",
          secondaryText: "Saltburn",
        },
        {
          text: "Bradley Cooper",
          secondaryText: "Maestro",
        },
        {
          text: "Cillian Murphy",
          secondaryText: "Oppenheimer",
        },
        {
          text: "Colman Domingo",
          secondaryText: "Rustin",
        },
        {
          text: "Leonardo DiCaprio",
          secondaryText: "Killers of the Flower Moon",
        },
      ],
      order: 6,
    },
    bestActressMusicalComedy: {
      value: 8,
      name:
        "Best Performance by a Female Actor in a Motion Picture – Musical or Comedy",
      nominees: [
        {
          text: "Alma Pöysti",
          secondaryText: "Fallen Leaves",
        },
        {
          text: "Emma Stone",
          secondaryText: "Poor Things",
        },
        {
          text: "Fantasia Barrino",
          secondaryText: "The Color Purple (2023)",
        },
        {
          text: "Jennifer Lawrence",
          secondaryText: "No Hard Feelings",
        },
        {
          text: "Margot Robbie",
          secondaryText: "Barbie",
        },
        {
          text: "Natalie Portman",
          secondaryText: "May December",
        },
      ],
      order: 7,
    },
    bestActorMusicalComedy: {
      value: 8,
      name:
        "Best Performance by a Male Actor in a Motion Picture – Musical or Comedy",
      nominees: [
        {
          text: "Jeffrey Wright",
          secondaryText: "American Fiction",
        },
        {
          text: "Joaquin Phoenix",
          secondaryText: "Beau is Afraid",
        },
        {
          text: "Matt Damon",
          secondaryText: "Air",
        },
        {
          text: "Nicolas Cage",
          secondaryText: "Dream Scenario",
        },
        {
          text: "Paul Giamatti",
          secondaryText: "The Holdovers",
        },
        {
          text: "Timothée Chalamet",
          secondaryText: "Wonka",
        },
      ],
      order: 8,
    },
    bestSupportingActress: {
      value: 4,
      name:
        "Best Performance by a Female Actor in a Supporting Role in any Motion Picture",
      nominees: [
        {
          text: "Danielle Brooks",
          secondaryText: "The Color Purple (2023)",
        },
        {
          text: "Da'Vine Joy Randolph",
          secondaryText: "The Holdovers",
        },
        {
          text: "Emily Blunt",
          secondaryText: "Oppenheimer",
        },
        {
          text: "Jodie Foster",
          secondaryText: "Nyad",
        },
        {
          text: "Julianne Moore",
          secondaryText: "May December",
        },
        {
          text: "Rosamund Pike",
          secondaryText: "Saltburn",
        },
      ],
      order: 16,
    },
    bestSupportingActor: {
      value: 4,
      name:
        "Best Performance by a Male Actor in a Supporting Role in any Motion Picture",
      nominees: [
        {
          text: "Charles Melton",
          secondaryText: "May December",
        },
        {
          text: "Mark Ruffalo",
          secondaryText: "Poor Things",
        },
        {
          text: "Robert De Niro",
          secondaryText: "Killers of the Flower Moon",
        },
        {
          text: "Robert Downey Jr.",
          secondaryText: "Oppenheimer",
        },
        {
          text: "Ryan Gosling",
          secondaryText: "Barbie",
        },
        {
          text: "Willem Dafoe",
          secondaryText: "Poor Things",
        },
      ],
      order: 15,
    },
    directing: {
      value: 4,
      name: "Best Director - Motion Picture",
      nominees: [
        {
          text: "Bradley Cooper",
          secondaryText: "Maestro",
        },
        {
          text: "Celine Song",
          secondaryText: "Past Lives",
        },
        {
          text: "Christopher Nolan",
          secondaryText: "Oppenheimer",
        },
        {
          text: "Greta Gerwig",
          secondaryText: "Barbie",
        },
        {
          text: "Martin Scorsese",
          secondaryText: "Killers of the Flower Moon",
        },
        {
          text: "Yorgos Lanthimos",
          secondaryText: "Poor Things",
        },
      ],
      order: 20,
    },
    screenplay: {
      value: 2,
      name: "Best Screenplay - Motion Picture",
      nominees: [
        {
          text: "Celine Song",
          secondaryText: "Past Lives",
        },
        {
          text: "Christopher Nolan",
          secondaryText: "Oppenheimer",
        },
        {
          text: "Eric Roth, Martin Scorsese",
          secondaryText: "Killers of the Flower Moon",
        },
        {
          text: "Greta Gerwig, Noah Baumbach",
          secondaryText: "Barbie",
        },
        {
          text: "Justine Triet, Arthur Harari",
          secondaryText: "Anatomy of a Fall",
        },
        {
          text: "Tony McNamara",
          secondaryText: "Poor Things",
        },
      ],
      order: 24,
    },
    musicOriginalScore: {
      value: 1,
      name: "Best Original Score - Motion Picture",
      nominees: [
        {
          text: "Spider-Man: Across the Spider-Verse",
          secondaryText: "Daniel Pemberton",
        },
        {
          text: "Poor Things",
          secondaryText: "Jerskin Fendrix",
        },
        {
          text: "Joe Hisaishi",
          secondaryText: "The Boy and the Heron",
        },
        {
          text: "Oppenheimer",
          secondaryText: "Ludwig Göransson",
        },
        {
          text: "The Zone of Interest",
          secondaryText: "Mica Levi",
        },
        {
          text: "Killers of the Flower Moon",
          secondaryText: "Robbie Robertson",
        },
      ],
      order: 22,
    },
    musicOriginalSong: {
      value: 1,
      name: "Best Original Song - Motion Picture",
      nominees: [
        {
          text: "She Came to Me",
          secondaryText: "Addicted to Romance",
        },
        {
          text: "Barbie",
          secondaryText: "Dance the Night",
        },
        {
          text: "Barbie",
          secondaryText: "I’m Just Ken",
        },
        {
          text: "The Super Mario Bros. Movie",
          secondaryText: "Peaches",
        },
        {
          text: "Rustin",
          secondaryText: "Road to Freedom",
        },
        {
          text: "Barbie",
          secondaryText: "What Was I Made For?",
        },
      ],
      order: 23,
    },
    bestTvSeriesDrama: {
      value: 16,
      name: "Best Television Series - Drama",
      nominees: [
        { text: "1923" },
        { text: "The Crown" },
        { text: "The Diplomat" },
        { text: "The Last of Us" },
        { text: "The Morning Show" },
        { text: "Succession" },
      ],
      order: 2,
    },
    bestTvSeriesMusicalComedy: {
      value: 16,
      name: "Best Television Series - Musical or Comedy",
      nominees: [
        { text: "Abbott Elementary" },
        { text: "Barry" },
        { text: "The Bear" },
        { text: "Jury Duty" },
        { text: "Only Murders in the Building" },
        { text: "Ted Lasso" },
      ],
      order: 3,
    },
    limitedSeriesTV: {
      value: 16,
      name:
        "Best Television Limited Series, Anthology Series, or Motion Picture Made for Television",
      nominees: [
        { text: "All the Light We Cannot See" },
        { text: "Beef" },
        {
          text: "Daisy Jones and the Six",
          movieDBName: "Daisy Jones & the Six",
        },
        { text: "Fargo" },
        { text: "Fellow Travelers" },
        { text: "Lessons in Chemistry" },
      ],
      order: 4,
    },
    bestActressTVDrama: {
      value: 8,
      name: "Best Performance by a Female Actor in a Television Series – Drama",
      nominees: [
        {
          text: "Bella Ramsey",
          secondaryText: "The Last of Us",
        },
        {
          text: "Emma Stone",
          secondaryText: "The Curse",
        },
        {
          text: "Helen Mirren",
          secondaryText: "1923",
        },
        {
          text: "Imelda Staunton",
          secondaryText: "The Crown",
        },
        {
          text: "Keri Russell",
          secondaryText: "The Diplomat",
        },
        {
          text: "Sarah Snook",
          secondaryText: "Succession",
        },
      ],
      order: 9,
    },
    bestActorTVDrama: {
      value: 8,
      name: "Best Performance by a Male Actor in a Television Series – Drama",
      nominees: [
        {
          text: "Brian Cox",
          secondaryText: "Succession",
        },
        {
          text: "Dominic West",
          secondaryText: "The Crown",
        },
        {
          text: "Gary Oldman",
          secondaryText: "Slow Horses",
        },
        {
          text: "Jeremy Strong",
          secondaryText: "Succession",
        },
        {
          text: "Kieran Culkin",
          secondaryText: "Succession",
        },
        {
          text: "Pedro Pascal",
          secondaryText: "The Last of Us",
        },
      ],
      order: 10,
    },
    bestActressTVMusicalComedy: {
      value: 8,
      name:
        "Best Performance by a Female Actor in a Television Series – Musical or Comedy",
      nominees: [
        {
          text: "Ayo Edebiri",
          secondaryText: "The Bear",
        },
        {
          text: "Elle Fanning",
          secondaryText: "The Great",
        },
        {
          text: "Natasha Lyonne",
          secondaryText: "Poker Face",
        },
        {
          text: "Quinta Brunson",
          secondaryText: "Abbott Elementary",
        },
        {
          text: "Rachel Brosnahan",
          secondaryText: "The Marvelous Mrs. Maisel",
        },
        {
          text: "Selena Gomez",
          secondaryText: "Only Murders in the Building",
        },
      ],
      order: 11,
    },
    bestActorTVMusicalComedy: {
      value: 8,
      name:
        "Best Performance by a Male Actor in a Television Series – Musical or Comedy",
      nominees: [
        {
          text: "Bill Hader",
          secondaryText: "Barry",
        },
        {
          text: "Jason Segel",
          secondaryText: "Shrinking",
        },
        {
          text: "Jason Sudeikis",
          secondaryText: "Ted Lasso",
        },
        {
          text: "Jeremy Allen White",
          secondaryText: "The Bear",
        },
        {
          text: "Martin Short",
          secondaryText: "Only Murders in the Building",
        },
        {
          text: "Steve Martin",
          secondaryText: "Only Murders in the Building",
        },
      ],
      order: 12,
    },
    bestActressLimitedTV: {
      value: 8,
      name:
        "Best Performance by a Female Actor in a Limited Series, Anthology Series, or a Motion Picture Made for Television",
      nominees: [
        {
          text: "Ali Wong",
          secondaryText: "Beef",
        },
        {
          text: "Brie Larson",
          secondaryText: "Lessons in Chemistry",
        },
        {
          text: "Elizabeth Olsen",
          secondaryText: "Love & Death",
        },
        {
          text: "Juno Temple",
          secondaryText: "Fargo",
        },
        {
          text: "Rachel Weisz",
          secondaryText: "Dead Ringers",
        },
        {
          text: "Riley Keough",
          secondaryText: "Daisy Jones and the Six",
        },
      ],
      order: 14,
    },
    bestActorLimitedTV: {
      value: 8,
      name:
        "Best Performance by a Male Actor in a Limited Series, Anthology Series, or a Motion Picture Made for Television",
      nominees: [
        {
          text: "David Oyelowo",
          secondaryText: "Lawmen: Bass Reeves",
        },
        {
          text: "Jon Hamm",
          secondaryText: "Fargo",
        },
        {
          text: "Matt Bomer",
          secondaryText: "Fellow Travelers",
        },
        {
          text: "Sam Claflin",
          secondaryText: "Daisy Jones and the Six",
        },
        {
          text: "Steven Yeun",
          secondaryText: "Beef",
        },
        {
          text: "Woody Harrelson",
          secondaryText: "White House Plumbers",
        },
      ],
      order: 13,
    },
    bestSupportingActressTV: {
      value: 4,
      name:
        "Best Performance by a Female Actor in a Supporting Role on Television",
      nominees: [
        {
          text: "Abby Elliott",
          secondaryText: "The Bear",
        },
        {
          text: "Christina Ricci",
          secondaryText: "Yellowjackets",
        },
        {
          text: "Elizabeth Debicki",
          secondaryText: "The Crown",
        },
        {
          text: "Hannah Waddingham",
          secondaryText: "Ted Lasso",
        },
        {
          text: "J. Smith-Cameron",
          secondaryText: "Succession",
        },
        {
          text: "Meryl Streep",
          secondaryText: "Only Murders in the Building",
        },
      ],
      order: 18,
    },
    bestSupportingActorTV: {
      value: 4,
      name:
        "Best Performance by a Male Actor in a Supporting Role on Television",
      nominees: [
        {
          text: "Alan Ruck",
          secondaryText: "Succession",
        },
        {
          text: "Alexander Skarsgård",
          secondaryText: "Succession",
        },
        {
          text: "Billy Crudup",
          secondaryText: "The Morning Show",
        },
        {
          text: "Ebon Moss-Bachrach",
          secondaryText: "The Bear",
        },
        {
          text: "James Marsden",
          secondaryText: "Jury Duty",
        },
        {
          text: "Matthew Macfadyen",
          secondaryText: "Succession",
        },
      ],
      order: 17,
    },
    bestPerformanceStandUp: {
      value: 2,
      name: "Best Performance in Stand-Up Comedy on Television",
      nominees: [
        {
          text: "Amy Schumer: Emergency Contact",
        },
        {
          text: "Chris Rock: Selective Outrage",
        },
        {
          text: "Ricky Gervais: Armageddon",
        },
        {
          text: "Sarah Silverman: Someone You Love",
        },
        {
          text: "Trevor Noah: Where Was I",
        },
        {
          text: "Wanda Sykes: I'm an Entertainer",
        },
      ],
      order: 19,
    },
  },
};
