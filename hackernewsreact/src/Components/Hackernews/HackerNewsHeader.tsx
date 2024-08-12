import './HackerNewsHeader.css'; // Import the CSS file

const HackerNewsHeader = () => {
    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid d-flex align-items-center">
                <img style={{ width: '15%' }} src="photos/logo.png" alt="Hacker News Logo" />
                <div className="search-container">
                    <select id="categorySelect" className="form-select" style={{ color: 'gray', border: 'none', outline: 'none', width: '150px' }}>
                        <option value="all">All</option>
                        <option value="story">Stories</option>
                        <option value="job">Job</option>
                        <option value="comment">Comment</option>
                        <option value="poll">Poll</option>
                        <option value="show-hn">Show-HN</option>
                        <option value="ask-hn">Ask-HN</option>
                    </select>
                    <div className="vertical-line"></div>
                    <input type="search" id="searchInput" placeholder="Search stories by title, url or author" />
                    <button type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
                <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <p style={{ marginTop: '15px', marginLeft: '10px', color: 'gray' }}>by</p>
                <img style={{ width: '5%', marginLeft: "10px" }} src="photos/Algolia_logo.png" alt="Algolia Logo" />
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ marginLeft: '120px' }}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-auto">
                        <li className="nav-item">
                            <a className="nav-link disabled" aria-current="page" href="#">Sort by:</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link selected" href="#" id="sort-by-popularity">Popularity</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link selected active" id="sort-by-date" href="#">Date</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default HackerNewsHeader;