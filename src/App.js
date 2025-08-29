import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "4463230a";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResult, setTotalResult] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const tempQuerry = "superman";

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`
          );
          if (!res.ok) throw new Error("something went wrong");
          const data = await res.json();
          setMovies(data.Search || []);
          setTotalResult(data.totalResults);
        } catch (er) {
          console.log(er);
          setError(er.message);
        } finally {
          setIsLoading(false);
        }
      }

      fetchMovies();
    },
    [query]
  );
  const fetchMoreMovies = async (page) => {
    try {
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&s=${query}&page=${page}`
      );

      if (!res.ok) throw new Error("Something went wrong");

      const data = await res.json();

      if (data.Response === "True") {
        setMovies((prevMovies) => [...prevMovies, ...data.Search]);
        setPage(page + 1);
      }
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSelectedMovie = async function (id) {
    setSelectedId(id);
  };
  useEffect(() => {
    if (!selectedId) return;

    const controller = new AbortController();

    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch movie details");
        const data = await res.json();
        setSelectedMovie(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      }
    };

    fetchMovie();

    return () => controller.abort();
  }, [selectedId]);

  function handleWatchedMovie(movie) {
    setWatched((prevWatched) => {
      const exists = prevWatched.find((m) => m.imdbID === movie.imdbID);
      if (exists) {
        // Update existing movie (merge new data)
        return prevWatched.map((m) =>
          m.imdbID === movie.imdbID ? { ...m, ...movie } : m
        );
      }
      return [...prevWatched, movie]; // add new movie
    });
  }

  const handleDelet = function (movieid) {
    setWatched((prev) => prev.filter((movie) => movie.imdbID !== movieid));
  };
  return (
    <>
      <Nav>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NameResault movies={movies} totalResult={totalResult} />
      </Nav>
      <Main>
        <Box>
          {isLoading ? (
            <Load />
          ) : error ? (
            <Error error={error} />
          ) : (
            <>
              <MovieList movies={movies} onSelectMovie={handleSelectedMovie} />
              {movies.length !== 0 ? (
                <button onClick={() => fetchMoreMovies()}>Show More</button>
              ) : (
                ""
              )}
            </>
          )}
        </Box>

        <Box>
          {selectedMovie ? (
            <MovieDetails
              selectedId={selectedId}
              movie={selectedMovie}
              onClose={() => {
                setSelectedMovie(null);
                setSelectedId(null);
              }}
              onWatchedMovie={handleWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onSetRating={handleWatchedMovie}
                onDelete={handleDelet}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

const Error = function ({ error }) {
  return (
    <>
      <p className="loader"> {error}</p>
    </>
  );
};
const Load = function () {
  return (
    <>
      <div className="spinnerWrapper">
        <span className="loader"></span>
      </div>
      <p className="loaderP">loading</p>
    </>
  );
};
const Nav = function ({ children }) {
  return <nav className="nav-bar">{children}</nav>;
};
const Logo = function () {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};
const Search = function ({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};
const NameResault = function ({ movies, totalResult }) {
  return (
    <>
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
        <span className="total-results">
          {totalResult ? `total results are: ${totalResult}` : ""}
        </span>
      </p>
    </>
  );
};
const Main = function ({ children }) {
  return <main className="main">{children}</main>;
};
const Box = function ({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};
const MovieList = function ({ movies, onSelectMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
};
const Movie = function ({ movie, onSelectMovie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3 onClick={() => onSelectMovie(movie.imdbID)}>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
};

const WatchedSummary = function ({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{parseFloat(avgImdbRating.toFixed(1))}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{parseFloat(avgUserRating.toFixed(1))}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{parseFloat(avgRuntime.toFixed(1))} min</span>
        </p>
      </div>
    </div>
  );
};
const WatchedMoviesList = ({ watched, onSetRating, onDelete }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onSetRating={onSetRating}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
const WatchedMovie = ({ movie, onSetRating, onDelete }) => {
  return (
    <li>
      <button className="delete-btn" onClick={() => onDelete(movie.imdbID)}>
        ❌
      </button>
      <img src={movie.poster} alt={movie.title} />
      <h3>{movie.title}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <StarRating
          size={24}
          rating={movie.userRating || 0}
          onSetRating={(rating) =>
            onSetRating({ ...movie, userRating: rating })
          }
        />
        <span>IMDB: {movie.imdbRating}</span>
        <span>Runtime: {movie.runtime} min</span>
      </div>
    </li>
  );
};

const MovieDetails = ({
  selectedId,
  movie,
  onClose,
  onWatchedMovie,
  watched,
}) => {
  const [userRating, setUserRating] = useState(
    watched.find((m) => m.imdbID === selectedId)?.userRating || 0
  );
  if (!movie) return null;

  const isWatched = watched.some((m) => m.imdbID === movie.imdbID);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Genre: genre,
  } = movie;

  // Find existing user rating if movie is already watched
  const existingRating =
    watched.find((m) => m.imdbID === selectedId)?.userRating || 0;

  // Add movie to watched list
  const handleAddMovie = () => {
    const newObj = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating: userRating,
    };
    onWatchedMovie(newObj);
  };

  return (
    <div className="movie-details">
      <button className="close-btn" onClick={onClose}>
        ❌
      </button>
      <h2>
        {title} ({year})
      </h2>
      <img src={poster} alt={title} />
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <StarRating
          size={30}
          rating={userRating}
          onSetRating={(rating) => setUserRating(rating)}
        />
        <button
          className="btn-add"
          onClick={handleAddMovie}
          disabled={isWatched}
          style={{
            cursor: isWatched ? "not-allowed" : "pointer",
            backgroundColor: isWatched ? "#ccc" : "#0077ff",
            color: isWatched ? "#555" : "#fff",
          }}
        >
          {isWatched ? "On watched list" : "Add to watched list"}
        </button>
      </div>
      <p>
        <strong>Genre:</strong> {genre}
      </p>
      <p>
        <strong>Plot:</strong> {plot}
      </p>
      <p>
        <strong>IMDB Rating:</strong> {imdbRating}
      </p>
      <p>
        <strong>user Rating:</strong> {userRating}
      </p>
    </div>
  );
};
