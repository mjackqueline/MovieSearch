let movies = [];

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        hideSpinner();
        document.getElementById('content').classList.remove('hidden');
    }, 1000); 
});

function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function searchMovies() {
    const query = document.getElementById('search-input').value;

    if (query.trim() === '') {
        alert('Please enter a movie name');
        return;
    }

    const apiUrl = `http://www.omdbapi.com/?apikey=c1f9c978&s=${encodeURIComponent(query)}&type=movie`;

    showSpinner();

    setTimeout(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True") {
                    movies = data.Search.slice(0, 9); 
                    fetchMovieDetails(movies);
                } else {
                    displayError(`No movies found for "${query}". Please try another search.`);
                }
            })
            .catch(error => {
                console.error("Error fetching movie data:", error);
                displayError('Error fetching movie data. Please try again later.');
            })
            .finally(() => {
                hideSpinner();
            });
    }, 2000); 
}

function fetchMovieDetails(movies) {
    const detailedMovies = movies.map(movie => {
        const detailUrl = `https://www.omdbapi.com/?apikey=c1f9c978&i=${movie.imdbID}`;
        
        return fetch(detailUrl)
            .then(response => response.json())
            .then(detailData => {
                return {
                    ...movie
                };
            });
    });

    Promise.all(detailedMovies).then(moviesWithDetails => {
        displayMovies(moviesWithDetails);
    }).catch(error => {
        console.error("Error fetching movie details:", error);
        displayError('Error fetching movie details. Please try again later.');
    });
}

function displayMovies(movies) {
    const movieContainer = document.getElementById('movie-container');
    const movieHTML = movies.map(movie => `
        <div class="wrapper">
            <div class="movie-topper"></div>
            <div class="movie">
                <img class="movie-img" src="${movie.Poster !== "N/A" ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}" data-id="${movie.imdbID}">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        </div>
    `).join('');
    movieContainer.innerHTML = movieHTML;

    // Add event listeners to movie images
    const movieImages = document.querySelectorAll('.movie-img');
    movieImages.forEach(img => {
        img.addEventListener('click', function() {
            const imdbID = this.getAttribute('data-id');
            openModal(imdbID);
        });
    });

    document.getElementById('search-container').classList.add('hidden');
    document.getElementById('results-container').classList.remove('hidden');
    document.getElementById('sort-container').classList.remove('hidden'); 
    document.getElementById('back-button').classList.remove('hidden'); 
}

function displayError(message) {
    const movieContainer = document.getElementById('movie-container');
    movieContainer.innerHTML = `<p>${message}</p>`;
    document.getElementById('search-container').classList.add('hidden');
    document.getElementById('results-container').classList.remove('hidden');
    document.getElementById('sort-container').classList.add('hidden'); 
    document.getElementById('back-button').classList.remove('hidden'); 
}

function sortMovies() {
    const sortOrder = document.getElementById('sort').value;
    if (sortOrder.startsWith('year')) {
        movies.sort((a, b) => {
            return sortOrder === 'year-asc' ? parseInt(a.Year) - parseInt(b.Year) : parseInt(b.Year) - parseInt(a.Year);
        });
    } else if (sortOrder.startsWith('title')) {
        movies.sort((a, b) => {
            return sortOrder === 'title-asc' 
                ? a.Title.toLowerCase().localeCompare(b.Title.toLowerCase()) 
                : b.Title.toLowerCase().localeCompare(a.Title.toLowerCase());
        });
    }
    displayMovies(movies); 
}

function goBack() {
    document.getElementById('search-container').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('sort-container').classList.add('hidden'); 
    document.getElementById('back-button').classList.add('hidden'); 
    document.getElementById('search-input').value = '';
    document.getElementById('movie-container').innerHTML = '';
    movies = []; 
}

function openModal(imdbID) {
    const detailUrl = `https://www.omdbapi.com/?apikey=c1f9c978&i=${imdbID}`;

    fetch(detailUrl)
        .then(response => response.json())
        .then(movie => {
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <div class="modal__half modal__img">
                    <h2><strong>${movie.Title}</strong></h2>
                    <figure><img src="${movie.Poster !== "N/A" ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}"></figure>
                </div>
                <div class="modal__half modal__about">
                    <div class"movie__title>
                        <h3> Movie Details</h3>
                    </div>
                    <div class="movie__details">
                        <p><strong>Year:</strong> ${movie.Year}</p>
                        <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                        <p><strong>Genre:</strong> ${movie.Genre}</p>
                        <p><strong>Plot:</strong> ${movie.Plot}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Actors:</strong> ${movie.Actors}</p>
                    </div>
                </div>
            `;
            document.querySelector('.modal-overlay').style.display = "block"; // Show overlay
            document.getElementById('movieModal').style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching movie details:", error);
        });
}

function closeModal() {
    document.getElementById('movieModal').style.display = "none";
    document.querySelector('.modal-overlay').style.display = "none"; // Hide overlay
}

document.querySelector('.close').addEventListener('click', closeModal);


document.querySelector('.modal-overlay').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});