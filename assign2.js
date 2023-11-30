/* url of song api --- https versions hopefully a little later this semester */	
const api = 'http://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';

 

/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/

document.addEventListener("DOMContentLoaded", function() {
   const logo = document.querySelector('.logo a');
   const searchLink = document.querySelector('[data-view="search"]');
   const playlistLink = document.querySelector('[data-view="playlist"]');
   const views = document.querySelectorAll('.view');
   let songsData = [];

   const storedData = localStorage.getItem('songsData');

   fetch(api)
   .then(function(response) {
      return response.json();
   })
   .then(function(data) {
      //console.log('Fetched data:', data);
      //console.log('Stored Data:', storedData);
      songsData = data;
      localStorage.setItem('songsData', JSON.stringify(songsData));
      displayTop('genre');
      displayTop('artist');
      displayMostPopularSongs();
      populateArtistDropdown();
      populateGenreDropdown();
      //displaySongs(songsData);
   })
   .catch(function(error) {
      console.error('Fetch error:', error);
   });
   //************Home View functions
   function displayTop(category) {
      const counts = {};
    
      // Count occurrences based on the provided category
      for (const item of songsData) {
        let key = '';
        if (category === 'genre') {
          key = item.genre.name;
        } else if (category === 'artist') {
          key = item.artist.name;
        } else if (category === 'songs') {
          key = item.title;
        }
    
        if (counts[key]) {
          counts[key]++;
        } else {
          counts[key] = 1;
        }
      }
    
      // Sort the counts
      const sorted = [];
      for (const name in counts) {
        sorted.push({ name: name, count: counts[name]});
      }
      sorted.sort((a, b) => b.count - a.count);
      const topFifteen = sorted.slice(0, 15).map(item => item.name);
    
      // Display the top 15 based on the category
      const homeView = document.getElementById('home');
      const col1 = homeView.querySelector('.home-col1');
      const col2 = homeView.querySelector('.home-col2');
    
      const box = document.createElement('div');
      box.classList.add(`${category}-box`);
      const categoryList = document.createElement('ul');
    
      for (const name of topFifteen) {
        const listItem = document.createElement('li');
        listItem.textContent = `${name} (${counts[name]})`;
        categoryList.appendChild(listItem);
      }
    
      if (category === 'genre') {
        col1.appendChild(box).appendChild(categoryList);
      } else if (category === 'artist') {
        col2.appendChild(box).appendChild(categoryList);
      }
    }

   function displayMostPopularSongs() {
      const sortedSongs = songsData.sort((a, b) => b.details.popularity - a.details.popularity).slice(0, 15);
  
      const popularSongsColumn = document.querySelector('.home-col3');
      const songsList = document.createElement('ol');
      for (const song of sortedSongs) {
         const listItem = document.createElement('li');
         listItem.textContent = `${song.title} by ${song.artist.name} - Popularity: ${song.details.popularity}`;
         listItem.dataset.songId = song.song_id;

         listItem.addEventListener('click', function() {
            showSongDetails(song);
         })
         songsList.appendChild(listItem);
     };
  
      popularSongsColumn.appendChild(songsList);
    }
    //************End of Home View funtions

    //************Start of Search functions
    async function fetchArtists() {
      const response = await fetch('artists.json');
      const artists = await response.json();
      return artists;
    }

    async function populateArtistDropdown() {
      const artists = await fetchArtists();
      const artistDropdown = document.getElementById('artist-dropdown');
      for (const artist of artists) {
         const option = document.createElement('option');
         option.value = artist.name;
         option.textContent = artist.name;
         artistDropdown.appendChild(option);
      }
    }

    async function fetchGenres() {
      const response = await fetch('genres.json');
      const genres = await response.json();
      return genres;
    }

    async function populateGenreDropdown() {
      const genres = await fetchGenres();
      const genreDropdown = document.getElementById('genre-dropdown');
      for (const genre of genres) {
         const option = document.createElement('option');
         option.value = genre.name;
         option.textContent = genre.name;
         genreDropdown.appendChild(option);
      }
    }
    function filterSongs() {
      const filterBy = document.querySelector('input[name="filterBy"]:checked').value;
      const searchText = document.getElementById('search-text').value.toLowerCase();
      const artistSelection = document.getElementById('artist-dropdown').value;
      const genreSelection = document.getElementById('genre-dropdown').value;

      let filteredSongs = [];

      if (filterBy === 'title') {
         //https://stackoverflow.com/questions/54232145/typeerror-item-name-tolowercase-include-is-not-a-function-reactjs
         filteredSongs = songsData.filter(song => song.title.toLowerCase().includes(searchText));
      }
      else if (filterBy === 'artist') {
         filteredSongs = songsData.filter(song => song.artist.name === artistSelection);
      }
      else if (filterBy === 'genre') {
         filteredSongs = songsData.filter(song => song.genre.name === genreSelection);
      }
      displaySongs(filteredSongs);
    }

    //https://forum.freecodecamp.org/t/sort-an-array-alphabetically-using-sort/259631/5
    function sortSongs(category) {
      songsData.sort(function(a, b) {
         if (category =='title') {
            return a.title.localeCompare(b.title);
         }
         else if (category === 'artist') {
            return a.artist.name.localeCompare(b.artist.name);
         }
         else if (category === 'year') {
            return parseInt(a.year) - parseInt(b.year);
         }
         else if (category === 'genre') {
            return a.genre.name.localeCompare(b.genre.name);
         }
      });
      displaySongs(songsData);
    }

    function displaySongs(songs) {
      const songList = document.getElementById('song-results');
      songList.innerHTML = '';
      for (const song of songs) {
         const listItem = document.createElement('tr'); // Create table row

         // Create table data cells for song details
         const titleCell = document.createElement('td');
         titleCell.textContent = song.title;

         const artistCell = document.createElement('td');
         artistCell.textContent = song.artist.name;

         const yearCell = document.createElement('td');
         yearCell.textContent = song.year;

         const genreCell = document.createElement('td');
         genreCell.textContent = song.genre.name;

         // Create "Add to Playlist" button cell
         const playlistCell = document.createElement('td');
         const addToPlaylistBtn = document.createElement('button');
         addToPlaylistBtn.textContent = 'Add to Playlist';
         addToPlaylistBtn.classList.add('add-to-playlist-btn');
         playlistCell.appendChild(addToPlaylistBtn);

         // Append cells to the row
         listItem.appendChild(titleCell);
         listItem.appendChild(artistCell);
         listItem.appendChild(yearCell);
         listItem.appendChild(genreCell);
         listItem.appendChild(playlistCell); // Add the "Add to Playlist" button

         

         songList.appendChild(listItem); // Append row to the table
     }
    }

    function clearFilters() {
      document.getElementById('search-text').value = '';
      document.getElementById('artist-dropdown').selectedIndex = 0;
      document.getElementById('genre-dropdown').selectedIndex = 0;
      displaySongs(songsData);
    }
    //***************End of Search functions

    //**********Start of Playlist functions
    function getSongDetails(row) {
      const [title, artist, year, genre] = row.querySelectorAll('td');
      return {
         title: title.textContent,
         artist: artist.textContent,
         year: year.textContent,
         genre: genre.textContent
      };
    }
    function addToPlaylist(song) {
      const playlistTable = document.getElementById('in-playlist');
      const newRow = document.createElement('tr');
  
      newRow.innerHTML = `
          <td>${song.title}</td>
          <td>${song.artist}</td>
          <td>${song.year}</td>
          <td>${song.genre}</td>
      `;

      
  
      playlistTable.appendChild(newRow);
  }
  //*************End of Playlist functions

  //***************Start of Single View functions
  function showSongDetails(song) {
   // Fetch elements within the details view to display song information
   const detailsTitle = document.querySelector('.details-column .details-col1 h3');
   const detailsInfo = document.querySelector('.details-column .details-col1');
   
   // Populate song details in the details view
   detailsTitle.textContent = song.title;
   
   // Construct the song details information and display it
   const detailsHTML = `
       <p>Title: ${song.title}</p>
       <p>Artist: ${song.artist.name}</p>
       <p>Genre: ${song.genre.name}</p>`;
   
   detailsInfo.innerHTML = detailsHTML;
   
   // Show the song details view
   showView('details');
}
   //*********************End of Single View functions

   //********************Start of Event Listeners and View
   // Initially show the home view
   document.getElementById('home').classList.add('active');
   // Function to hide all views
   function hideAllViews() {
       for (const view of views) {
         view.classList.remove('active');
       };
   }

   // Function to show a specific view
   function showView(viewId) {
       hideAllViews();
       document.getElementById(viewId).classList.add('active');
   }

   // Click event for the logo
   logo.addEventListener('click', function(event) {
       event.preventDefault();
       showView('home');
   });

   // Click event for the search link
   searchLink.addEventListener('click', function(event) {
       event.preventDefault();
       showView('search');
   });

   // Click event for the playlist link
   playlistLink.addEventListener('click', function(event) {
       event.preventDefault();
       showView('playlist');
   });
   const searchButton = document.getElementById('search-button');
   searchButton.addEventListener('click', function() {
      filterSongs();
   });
   const clearButton = document.getElementById('clear-button');
   clearButton.addEventListener('click', function() {
      clearFilters();
   });
   const titleColumnHeading = document.getElementById('title-column-heading');
   const artistColumnHeading = document.getElementById('artist-column-heading');
   const yearColumnHeading = document.getElementById('year-column-heading');
   const genreColumnHeading = document.getElementById('genre-column-heading');  
   titleColumnHeading.addEventListener('click', function() {
      sortSongs('title');
   });
   artistColumnHeading.addEventListener('click', function() {
      sortSongs('artist');
   });
   yearColumnHeading.addEventListener('click', function() {
      sortSongs('year');
   });
   genreColumnHeading.addEventListener('click', function() {
      sortSongs('genre');
   });

   const songResultsTable = document.getElementById('song-table');
   songResultsTable.addEventListener('click', function(event) {
      if (event.target.classList.contains('add-to-playlist-btn')) {
         //https://allthingssmitty.com/2019/03/25/using-closest-to-return-the-correct-dom-element/
         const selectedRow = event.target.closest('tr');
         const songDetails = getSongDetails(selectedRow);
         addToPlaylist(songDetails);
      }
   })
   const playlistTable = document.getElementById('playlist-table');
   playlistTable.addEventListener('click', function(event) {
      const clickedElement = event.target.closest('#in-playlist td');
      if (clickedElement) {
          const clickedRow = clickedElement.parentNode;
          const songDetails = getSongDetails(clickedRow);
          showSongDetails(songDetails);
      }
  });

});
