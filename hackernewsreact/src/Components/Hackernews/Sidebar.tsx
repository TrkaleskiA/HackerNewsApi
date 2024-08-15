import { FC } from 'react';
import './Sidebar.css';

// Define the type for the filter options
type FilterType = 'all' | 'hot' | 'show-hn' | 'ask-hn' | 'poll' | 'job' | 'starred';

interface SidebarProps {
    onFilterChange: (filterType: FilterType) => void;
}

const Sidebar: FC<SidebarProps> = ({ onFilterChange }) => {
    const handleFilterClick = (filterType: FilterType) => {
        onFilterChange(filterType);
    };

    return (
        <ul className="custom-list">
            <div className="custom-list-div" id="all" onClick={() => handleFilterClick('all')}>
                <li className="news"><a href="#">All</a></li>
            </div>
            <div className="custom-list-div" id="hot" onClick={() => handleFilterClick('hot')}>
                <li className="hot"><a href="#">Hot</a></li>
            </div>
            <div className="custom-list-div" id="show-hn" onClick={() => handleFilterClick('show-hn')}>
                <li className="show-hn"><a href="#">Show HN</a></li>
            </div>
            <div className="custom-list-div" id="ask-hn" onClick={() => handleFilterClick('ask-hn')}>
                <li className="ask-hn"><a href="#">Ask HN</a></li>
            </div>
            <div className="custom-list-div" id="poll" onClick={() => handleFilterClick('poll')}>
                <li className="polls"><a href="#">Polls</a></li>
            </div>
            <div className="custom-list-div" id="job" onClick={() => handleFilterClick('job')}>
                <li className="jobs"><a href="#">Jobs</a></li>
            </div>
            <div className="custom-list-div" id="starred" onClick={() => handleFilterClick('starred')}>
                <li id="starred-link"><a href="#">Starred</a></li>
            </div>
        </ul>
    );
};

export default Sidebar;
