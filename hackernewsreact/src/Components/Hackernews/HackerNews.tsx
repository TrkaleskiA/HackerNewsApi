import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import HackerNewsHeader from './HackerNewsHeader';
import Sidebar from './Sidebar';
import './HackerNews.css';
import Topbar from './Topbar';
import Stories from './Stories';

// Define the type for the filter state
type FilterType = 'all' | 'hot' | 'show-hn' | 'ask-hn' | 'poll' | 'job' | 'starred';
type TimePeriod = 'last-24h' | 'past-week' | 'past-month' | 'forever';
type SortType = 'date' | 'popularity';
function HackerNews() {
    const [nickname, setNickname] = useState<string>('');
    const [filter, setFilter] = useState<FilterType>('all'); // State for filter
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('forever');
    const [sort, setSort] = useState<SortType>('date');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            const user = JSON.parse(userCookie);
            setNickname(user.nickname);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        Cookies.remove('user');
        navigate('/login');
    };

    const handleAddStory = () => {
        navigate('/addstory');
    };

    // Function to handle filter change
    const handleFilterChange = (filterType: FilterType) => {
        setFilter(filterType);
    };

    const handleTimePeriodChange = (period: TimePeriod) => {
        setTimePeriod(period);
    };

    const handleSortChange = (sortType: SortType) => {
        setSort(sortType);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <>
            <HackerNewsHeader onSortChange={handleSortChange} currentSort={sort} onSearchChange={handleSearchChange} filter={filter}/>
            <div className="container-fluid body">
                <div className="row">
                    <div className="col-lg-2 col-md-3 col-sm-12 mb-3 pt-3 div-list">
                        <Sidebar onFilterChange={handleFilterChange} />
                    </div>
                    <div className="col-lg-10 col-md-9 col-sm-12 main-div">
                        <Topbar onTimePeriodChange={handleTimePeriodChange}/>
                        <Stories filter={filter} timePeriod={timePeriod} sort={sort} searchQuery={searchQuery} />
                    </div>
                </div>
            </div>

            <div>
                <p>Hello {nickname}!</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <div>
                <button onClick={handleAddStory}>Add new Story</button>
            </div>
        </>
    );
}

export default HackerNews;
